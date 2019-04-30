import * as vscode from 'vscode';
import * as path from 'path';
import { ServiceBusNamespace, Queue } from '../service-bus/service-bus-models';

/**
 * Tree Data Provider for Queues
 */
export class QueueTreeDataProvider implements vscode.TreeDataProvider<QueueTreeItem> {

	private _onDidChangeTreeData: vscode.EventEmitter<QueueTreeItem | undefined> = new vscode.EventEmitter<QueueTreeItem | undefined>();
	readonly onDidChangeTreeData: vscode.Event<QueueTreeItem | undefined> = this._onDidChangeTreeData.event;

	constructor(private serviceBusNamespace: ServiceBusNamespace) { }

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: QueueTreeItem): vscode.TreeItem {
		return element;
	}

	getChildren(element?: QueueTreeItem): Thenable<QueueTreeItem[]> {
		let queues: QueueTreeItem[] = [];
		if (!element) {
			queues = this.serviceBusNamespace.queues
				.sort((a, b) => a.QueueName.localeCompare(b.QueueName))
				.map(q => q.QueueTreeItem);
		}

		return Promise.resolve(queues);
	}
}

/**
 * Queue Tree Item
 */
export class QueueTreeItem extends vscode.TreeItem {
	constructor(public queue: Queue) {
		super(queue.QueueName, vscode.TreeItemCollapsibleState.None);
		this.queue = { ...queue };
		this.command = {
			command: 'queues.view',
			title: 'View Queue',
			arguments: [
				this.queue
			]
		};
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'light', 'azure-service-bus-queue.svg'),
		dark: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'dark', 'azure-service-bus-queue.svg')
	};

	contextValue = 'queue';
}