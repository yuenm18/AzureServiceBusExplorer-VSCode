import * as vscode from 'vscode';
import { QueueService } from '../queues/queue-service';
import { TopicService } from '../topics/topic-service';
import { ServiceBusWebviewPanel } from './service-bus-webview-panel';
import { ServiceBusApi } from './service-bus-api';
import { ServiceBusNamespace } from './service-bus-models';

/**
 * Service Bus Manager
 * Holds all service bus logic
 */
export class ServiceBusManager {
    private static ConnectionStringName = 'azureServiceBusExplorer.connectionString';

    queueService: QueueService;
    topicService: TopicService;
    webviewPanel: ServiceBusWebviewPanel;
    serviceBusService: ServiceBusApi;
    serviceBusNamespace: ServiceBusNamespace;

    constructor(private context: vscode.ExtensionContext) {
        this.webviewPanel = new ServiceBusWebviewPanel(this.context);

        let connectionString = this.getDefaultConnectionString();
        this.serviceBusNamespace = new ServiceBusNamespace(connectionString);
        this.serviceBusService = new ServiceBusApi(this.serviceBusNamespace);
        this.queueService = new QueueService(this.serviceBusNamespace, this.serviceBusService, this.webviewPanel);
        this.topicService = new TopicService(this.serviceBusNamespace, this.serviceBusService, this.webviewPanel);

        // ask for a conneciton string if it doesn't exist in settings
        if (!connectionString) {
            this.updateDefaultConnectionString();
        }

    }

    /**
     * Gets the default connection string
     */
    getDefaultConnectionString(): string {
        let configuration = vscode.workspace.getConfiguration();
        let connectionString = configuration.get<string>(ServiceBusManager.ConnectionStringName, '');

        return connectionString;
    }

    /**
     * Updates default connection string
     */
    async updateDefaultConnectionString(): Promise<void> {
        let connectionString = await vscode.window.showInputBox({
            prompt: 'Enter the service bus connection string',
            value: this.serviceBusNamespace.connectionString
        }) || '';

        if (connectionString) {
            // save connection string in settings
            let configuration = vscode.workspace.getConfiguration();
            configuration.update(ServiceBusManager.ConnectionStringName, connectionString, vscode.ConfigurationTarget.Global);
    
            // save the conneciton string and refresh the tree views
            this.serviceBusNamespace.connectionString = connectionString;
            this.queueService.listQueues();
            this.topicService.listTopics();  
        }
    }
}