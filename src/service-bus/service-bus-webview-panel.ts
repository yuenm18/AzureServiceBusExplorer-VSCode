import * as vscode from 'vscode';
import * as path from 'path';
import { Queue, Topic, Subscription, Rule, ServiceBusEntity } from './service-bus-models';
import { ServiceBusUtilities } from './service-bus-utilities';


interface WebviewState {
    entity: ServiceBusEntity;
    messages: Message[];
    uiState: any;
    isActive: boolean;
}

interface Message {
    command: Command;
    entity: ServiceBusEntity;
}

export enum Command {
    Refresh = 'refresh',

}

/**
 * Service bus webview panel
 */
export class ServiceBusWebviewPanel {
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

            this._webviewPanel.onDidChangeViewState(e => {
                // save and restore webview
                let panel = e.webviewPanel;
                switch (panel.visible) {
                    case true: this.restoreViewState(); break;
                    case false: this.saveUIState(); break;
                }

            });

            this._webviewPanel.onDidDispose(() => {
                // set webview to undefined if it is disposed so a new one will be created if needed
                this._webviewPanel = undefined;
            },
                null,
                this.context.subscriptions);

            this.populateWebviewContent();
        }

        return this._webviewPanel;
    }

    states: WebviewState[] = [];

    constructor(private context: vscode.ExtensionContext) { }

    /**
     * Get the currently displayed service bus entity
     */
    getDisplayedEntity(): ServiceBusEntity | undefined {
        let activeState = this.states.find(s => s.isActive);
        if (activeState) {
            return activeState.entity;
        }
    }

    /**
     * Refreshes the webview if any of the service bus entities are updated
     * @param entities The updated service bus entities
     */
    refreshWebview(...entities: ServiceBusEntity[]) {
        let visibleEntityId = ServiceBusUtilities.getEntityId(this.getDisplayedEntity());
        let visibleEntity = entities.find(e => ServiceBusUtilities.getEntityId(e) === visibleEntityId);
        if (visibleEntity) {
            this.displayEntity(visibleEntity);
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

    saveUIState() {

    }

    /**
     * Displays entity in the webview
     * @param entity The entity to refresh
     */
    displayEntity(entity: ServiceBusEntity) {
        this.postMessage({
            command: Command.Refresh,
            entity: entity
        });
    }

    /**
     * Save the view state
     * @param entity The entity to save
     */
    saveState(entity: ServiceBusEntity) {
        this.states.forEach(s => s.isActive = false);
        let state = this.states.find(s => ServiceBusUtilities.getEntityId(s.entity) === ServiceBusUtilities.getEntityId(entity));
        if (!state) {
            state = {
                entity: entity,
                messages: [],
                uiState: {},
                isActive: true
            };
            this.states.push(state);
        }

        state.entity = entity;
        state.isActive = true;
    }

    restoreViewState() {
        let entity = this.states.find(s => s.isActive);
        // this.postMessage({
        //     command: Command.refresh,
        //     queue: entity
        // });
    }

    /**
     * Post a message to the webview
     * @param message The message to send to the view
     */
    postMessage(message: Message) {
        switch (message.command) {
            case Command.Refresh: {
                this.saveState(message.entity);
                break;
            }
        }

        this.webviewPanel.webview.postMessage(message);
    }

    viewQueue(queue: Queue) {

    }

    viewTopic(topic: Topic) {

    }

    viewSubscription(subscription: Subscription) {

    }

    viewRule(rule: Rule) {

    }

    /**
     * sets webview content
     */
    private populateWebviewContent() {
        let jsFile = path.join(__filename, '..', '..', '..', 'views', 'view.js');
        this.webviewPanel.webview.html = `
<!DOCTYPE html>
<html>
	<head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src vscode-resource:; style-src vscode-resource:;">
        <meta name="viewpoint" context="width=device-width, initial-scale=1.0">
	</head>
    <body>
        <pre></pre>
    </body>
    <script src="vscode-resource:${jsFile}"></script>
</html>
`;
    }
}
