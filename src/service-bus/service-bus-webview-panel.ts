import * as vscode from 'vscode';
import * as path from 'path';
import { ServiceBusEntity, ServiceBusEntityType, Message } from './service-bus-models';
import { ServiceBusUtilities } from './service-bus-utilities';


interface WebviewMessage {
    command: Command;
    state: WebviewState;
    data: any;
}

class WebviewState {
    private static stateIdCounter = 0;

    stateId: number;
    messages: Message[];
    deadLetterMessages: Message[];
    uiState: { [key: string]: string };
    isActive: boolean;
    constructor(public type: ServiceBusEntityType, public entity: ServiceBusEntity) {
        this.stateId = WebviewState.stateIdCounter++;
        this.messages = [];
        this.deadLetterMessages = [];
        this.uiState = {};
        this.isActive = true;
    }
}

type Command = OutboundCommand | InboundCommand;

enum OutboundCommand {
    Refresh = 'refresh',
}

enum InboundCommand {
    SetUI = 'set-ui',
    SendMessage = 'send-message',
    PeekMessages = 'peek-messages',
    PeekDeadLetter = 'peek-messages',
}

/**
 * Service bus webview panel
 */
export class ServiceBusWebviewPanel {
    private states: WebviewState[] = [];

    private _webviewPanel: vscode.WebviewPanel | undefined;
    private get webviewPanel() {
        if (!this._webviewPanel) {
            // create webview panel if it doesn't exist
            this._webviewPanel = vscode.window.createWebviewPanel('serviceBusExplorer',
                'Azure Service Bus Explorer',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'views'))]
                });

            this._webviewPanel.onDidChangeViewState(async e => {
                // save and restore webview
                let panel = e.webviewPanel;
                if (panel.visible) {
                    this.restoreWebviewState();
                }

            });

            this._webviewPanel.onDidDispose(() => {
                // set webview to undefined if it is disposed so a new one will be created if needed
                this._webviewPanel = undefined;
            },
                null,
                this.context.subscriptions);

            this._webviewPanel.webview.onDidReceiveMessage(this.onReceivedMessageFromWebview, undefined, this.context.subscriptions);

            this.populateWebviewContent();
        }

        return this._webviewPanel;
    }


    constructor(private context: vscode.ExtensionContext) { }

    /**
     * Displays an entity in the webview
     * @param type The service bus entity type
     * @param entity The service bus entity
     */
    showEntity(type: ServiceBusEntityType, entity: ServiceBusEntity) {
        let state = this.getOrSaveState(type, entity);
        this.displayState(state);
    }

    /**
     * Updates the messages
     * @param type The service bus entity type
     * @param entity The service bus entity
     * @param messages The messages
     */
    updateMessages(type: ServiceBusEntityType, entity: ServiceBusEntity, messages: Message[]) {
        let state = this.states.find(s => ServiceBusUtilities.getEntityId(s.entity) === ServiceBusUtilities.getEntityId(entity));
        if (state) {
            state.messages = messages;
            this.refreshWebview(type, entity);
        }
    }

    /**
     * Refreshes the webview if any of the service bus entities are updated
     * @param entities The updated service bus entities
     */
    refreshWebview(type: ServiceBusEntityType, ...entities: ServiceBusEntity[]) {
        let activeEntityId = ServiceBusUtilities.getEntityId(this.getDisplayedEntity());
        let visibleEntity = entities.find(e => ServiceBusUtilities.getEntityId(e) === activeEntityId);
        if (visibleEntity) {
            this.showEntity(type, visibleEntity);
        }
    }

    /**
     * Closes webview if entity is displayed (ie. if the entity is deleted, the webview should close if it is displaying the entity)
     * @param entity The entity
     */
    closeWebviewForEntity(entity: ServiceBusEntity) {
        let visibleEntityId = ServiceBusUtilities.getEntityId(this.getDisplayedEntity());
        if (visibleEntityId === ServiceBusUtilities.getEntityId(entity)) {
            let stateToRemoveIndex = this.states.findIndex(s => ServiceBusUtilities.getEntityId(s.entity) === visibleEntityId);
            this.states.splice(stateToRemoveIndex, 1);
            this.webviewPanel.dispose();
        }
    }

    /**
     * Handes messages sent from the webview
     * @param message Message from webview
     */
    private onReceivedMessageFromWebview = (message: WebviewMessage) => {
        let state = this.states.find(s => s.stateId === message.state.stateId);
        if (!state) {
            console.error(`Could not find state id ${message.state.stateId}`);
            return;
        }
        switch (message.command) {
            case InboundCommand.SetUI: {
                state.uiState = message.data;
                break;
            }
            case InboundCommand.SendMessage: {
                let messageToSend = message.data;
                switch (state.type) {
                    case ServiceBusEntityType.Queue: {
                        vscode.commands.executeCommand('queues.send', state.entity, messageToSend);
                        break;
                    }
                    case ServiceBusEntityType.Topic: {
                        vscode.commands.executeCommand('topics.send', state.entity, messageToSend);
                        break;
                    }
                }
                break;
            }
            case InboundCommand.PeekMessages: {
                let count = message.data;
                switch (state.type) {
                    case ServiceBusEntityType.Queue: {
                        vscode.commands.executeCommand('queues.peek', state.entity, count);
                        break;
                    }
                    case ServiceBusEntityType.Subscription: {
                        vscode.commands.executeCommand('subscriptions.peek', state.entity, count);
                        break;
                    }
                }
                break;
            }
            case InboundCommand.SetUI: {
                state.uiState = message.data;
                break;
            }
            default: {
                console.error(`Invalid command from webview ${message.command}`);
                break;
            }
        }
    }

    /**
     * Displays the active state
     */
    private restoreWebviewState() {
        let currentState = this.states.find(s => s.isActive);
        if (currentState) {
            this.displayState(currentState);
        }
    }

    /**
     * Displays the state in the webview
     * @param state The state to display
     */
    private displayState(state: WebviewState) {
        let refreshMessage = {
            command: OutboundCommand.Refresh,
            state: state
        };

        this.webviewPanel.webview.postMessage(refreshMessage);
    }

    /**
     * Gets an existing state or saves the entity into a new state and returns it
     * @param type The service bus type
     * @param entity The service bus entity
     */
    private getOrSaveState(type: ServiceBusEntityType, entity: ServiceBusEntity) {
        this.states.forEach(s => s.isActive = false);
        let state = this.states.find(s => ServiceBusUtilities.getEntityId(s.entity) === ServiceBusUtilities.getEntityId(entity));
        if (!state) {
            state = new WebviewState(type, entity);
            this.states.push(state);
        }

        state.type = type;
        state.entity = entity;
        state.isActive = true;
        return state;
    }

    /**
     * Gets the current displayed entity
     */
    private getDisplayedEntity(): ServiceBusEntity | undefined {
        let activeState = this.getActiveState();
        if (activeState) {
            return activeState.entity;
        }
    }

    /**
     * Gets the active state
     */
    private getActiveState(): WebviewState | undefined {
        return this.states.find(s => s.isActive);
    }

    /**
     * Sets webview content
     */
    private populateWebviewContent() {
        let jsFile = path.join(__filename, '..', '..', '..', 'views', 'main.js');
        let cssFile = path.join(__filename, '..', '..', '..', 'views', 'styles.css');
        this.webviewPanel.webview.html = `
<!DOCTYPE html>
<html>
	<head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src vscode-resource:; style-src vscode-resource:;">
        <meta name="viewpoint" context="width=device-width, initial-scale=1.0">
        <script async type="module" src="vscode-resource:${jsFile}"></script>
        <link rel="stylesheet" href="vscode-resource:${cssFile}"></link>
	</head>
    <body>
        <header class="header-section"></header>
        <main class="main-container">
            <aside class="details-section"></aside>
            <article class="messages-container">
                <section class="view-messages-section"></section>
                <section class="send-messages-section"></section>
            </article>
        </main>
        <pre></pre>
    </body>
</html>
`;
    }
}
