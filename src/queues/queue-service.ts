import * as vscode from 'vscode';
import { Azure } from 'azure-sb';
import CreateQueueOptions = Azure.ServiceBus.CreateQueueOptions;
import { QueueTreeDataProvider, QueueTreeItem } from './queue-provider';
import { ServiceBusNamespace, Queue, ServiceBusType } from '../service-bus/service-bus-models';
import { ServiceBusServicePromise } from '../service-bus/service-bus-service-promise';
import { ServiceBusWebviewPanel } from '../service-bus/service-bus-webview-panel';
import { ServiceBusUtilities } from '../service-bus/service-bus-utilities';
import { QueueUtilities } from './queue-utilities';

/**
 * Queue Service
 * Handles VSCode commands associated with queues
 */
export class QueueService {
	treeDataProvider: QueueTreeDataProvider;

	constructor(
		private serviceBusNamespace: ServiceBusNamespace,
		private serviceBusService: ServiceBusServicePromise,
		private webviewPanel: ServiceBusWebviewPanel) {

		this.listQueues();
		this.treeDataProvider = new QueueTreeDataProvider(this.serviceBusNamespace);
	}

	/**
	 * Retrieves all queues
	 */
	listQueues() {
		vscode.window.withProgress({
			title: 'Loading Queues',
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// get the queues
				let queues = <Queue[]>await this.serviceBusService.listQueuesPromise({});
				queues.forEach(q => q.QueueTreeItem = new QueueTreeItem(q));
				this.serviceBusNamespace.queues = queues;

				// update UI
				this.webviewPanel.refreshWebview(...queues);
				this.treeDataProvider.refresh();
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Refreshes a queue
	 * @param queue The queue that needs ot be refreshed
	 */
	refreshQueue(queue: Queue) {
		vscode.window.withProgress({
			title: `Refreshing '${queue.QueueName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// refresh queue
				let refreshedQueue = <Queue>await this.serviceBusService.getQueuePromise(queue.QueueName);
				refreshedQueue.QueueTreeItem = new QueueTreeItem(refreshedQueue);

				// splice in refreshed queue
				let queueIndex = this.serviceBusNamespace.queues.findIndex(q => q.QueueName === queue.QueueName);
				if (queueIndex > -1) {
					this.serviceBusNamespace.queues.splice(queueIndex, 1, refreshedQueue);
				}

				// update UI
				this.webviewPanel.refreshWebview(refreshedQueue);
				this.treeDataProvider.refresh();
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Creates a queue
	 */
	async createQueue() {
		try {
			// prompt for queue name and queue options, then create queue
			let queueName = await ServiceBusUtilities.showCreateNameInput(this.serviceBusNamespace.queues.map(q => q.QueueName), ServiceBusType.Queue);
			let queueCreateOptions = QueueUtilities.getDefaultQueueCreateOptions();
			let createQueueOptions = await ServiceBusUtilities.showCreateOptionsSelector<CreateQueueOptions>(queueCreateOptions, queueName, ServiceBusType.Queue);

			await this.sendCreateQueueRequest(queueName, createQueueOptions);
		} catch (e) {
			console.warn('Queue not created.', e);
		}
	}

	/**
	 * Sends the create queue api request
	 * @param queueName The name of the queue to create
	 * @param queueCreateOptions The queue creation options
	 */
	private sendCreateQueueRequest(queueName: string, queueCreateOptions: CreateQueueOptions) {
		vscode.window.withProgress({
			title: `Creating '${queueName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// create queue
				let newQueue = <Queue>await this.serviceBusService.createQueuePromise(<string>queueName, queueCreateOptions);
				newQueue.QueueTreeItem = new QueueTreeItem(newQueue);

				// put queue into the in memory list
				this.serviceBusNamespace.queues.push(newQueue);

				// update UI
				this.treeDataProvider.refresh();
				vscode.window.showInformationMessage(`'${newQueue.QueueName}' created successfully`);
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Deletes a queue
	 * @param queue The queue to delete
	 */
	async deleteQueue(queue: Queue) {
		try {
			// show a confirm delete dialog and delete the queue if the user confirms
			let confirmDelete = await ServiceBusUtilities.showConfirmDelete(queue.QueueName, ServiceBusType.Queue);
			if (confirmDelete) {
				await this.sendDeleteQueueRequest(queue);
			}
		} catch (e) {
			console.warn(`Did not delete queue '${queue.QueueName}'.`, e);
		}
	}

	/**
	 * Sends the delete queue api request
	 * @param queue The queue to delete
	 */
	private async sendDeleteQueueRequest(queue: Queue) {
		return vscode.window.withProgress({
			title: `Deleting '${queue.QueueName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// delete queue
				await this.serviceBusService.deleteQueuePromise(queue.QueueName);

				// splice queue out of list
				let queueIndex = this.serviceBusNamespace.queues.findIndex(q => q.QueueName === queue.QueueName);
				if (queueIndex > -1) {
					this.serviceBusNamespace.queues.splice(queueIndex, 1);
				}

				// update UI
				this.webviewPanel.closeWebviewForEntity(queue);
				this.treeDataProvider.refresh();
				vscode.window.showInformationMessage(`'${queue.QueueName}' deleted successfullly`);
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Displays a subscription
	 * @param queue The queue to view
	 */
	viewQueue(queue: Queue) {
		this.webviewPanel.displayEntity(queue);
	}
}