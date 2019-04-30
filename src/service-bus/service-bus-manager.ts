import * as vscode from 'vscode';
import { QueueService } from '../queues/queue-service';
import { TopicService } from '../topics/topic-service';
import { ServiceBusWebviewPanel } from './service-bus-webview-panel';
import { ServiceBusServicePromise } from './service-bus-service-promise';
import { ServiceBusNamespace } from './service-bus-models';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Service Bus Manager
 * Holds all service bus logic
 */
export class ServiceBusManager {
    queueService: QueueService;

    topicService: TopicService;

    webviewPanel: ServiceBusWebviewPanel;

    connectionString: string;

    serviceBusService: ServiceBusServicePromise;

    serviceBusNamespace: ServiceBusNamespace;

    constructor(private context: vscode.ExtensionContext) {
        let configuration = this.readConfiguration();
        this.connectionString = configuration.connectionString;
        this.webviewPanel = new ServiceBusWebviewPanel(this.context);
        this.serviceBusNamespace = new ServiceBusNamespace(this.connectionString);
        this.serviceBusService = new ServiceBusServicePromise(this.serviceBusNamespace.connectionString);
        this.queueService = new QueueService(this.serviceBusNamespace, this.serviceBusService, this.webviewPanel);
        this.topicService = new TopicService(this.serviceBusNamespace, this.serviceBusService, this.webviewPanel);

    }

    readConfiguration(): any {
        let configuration = fs.readFileSync(path.join(__filename, '..', '..', '..', 'src', 'test', 'configuration.json'), 'utf8');
        return JSON.parse(configuration);
    }
}