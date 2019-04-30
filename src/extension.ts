// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ServiceBusManager } from './service-bus/service-bus-manager';
import { QueueTreeItem } from './queues/queue-provider';
import { Queue, Topic, Subscription, Rule } from './service-bus/service-bus-models';
import { TopicTreeItem, SubscriptionTreeItem, RuleTreeItem } from './topics/topic-provider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "azure-service-bus-explorer" is now active!');

	let serviceBusManager = new ServiceBusManager(context);
	let queueService = serviceBusManager.queueService;
	let topicService = serviceBusManager.topicService;

	context.subscriptions.push(vscode.window.registerTreeDataProvider('queues', queueService.treeDataProvider));
	context.subscriptions.push(vscode.commands.registerCommand('queues.loadAll', () => queueService.listQueues()));
	context.subscriptions.push(vscode.commands.registerCommand('queues.refresh', (queueTreeItem: QueueTreeItem) => queueService.refreshQueue(queueTreeItem.queue)));
	context.subscriptions.push(vscode.commands.registerCommand('queues.create', () => queueService.createQueue()));
	context.subscriptions.push(vscode.commands.registerCommand('queues.delete', (queueTreeItem: QueueTreeItem) => queueService.deleteQueue(queueTreeItem.queue)));
	context.subscriptions.push(vscode.commands.registerCommand('queues.view', (queue: Queue) => queueService.viewQueue(queue)));

	context.subscriptions.push(vscode.window.registerTreeDataProvider('topics', topicService.treeDataProvider));
	context.subscriptions.push(vscode.commands.registerCommand('topics.loadAll', () => topicService.listTopics()));
	context.subscriptions.push(vscode.commands.registerCommand('topics.refresh', (topicTreeItem: TopicTreeItem) => topicService.refreshTopic(topicTreeItem.topic)));
	context.subscriptions.push(vscode.commands.registerCommand('topics.create', () => topicService.createTopic()));
	context.subscriptions.push(vscode.commands.registerCommand('topics.delete', (topicTreeItem: TopicTreeItem) => topicService.deleteTopic(topicTreeItem.topic)));
	context.subscriptions.push(vscode.commands.registerCommand('topics.view', (topic: Topic) => topicService.viewTopic(topic)));
	
	context.subscriptions.push(vscode.commands.registerCommand('subscriptions.refresh', (subscriptionTreeItem: SubscriptionTreeItem) => topicService.refreshSubscription(subscriptionTreeItem.subscription)));
	context.subscriptions.push(vscode.commands.registerCommand('subscriptions.create', (topicTreeItem: TopicTreeItem) => topicService.createSubscription(topicTreeItem.topic)));
	context.subscriptions.push(vscode.commands.registerCommand('subscriptions.delete', (subscriptionTreeItem: SubscriptionTreeItem) => topicService.deleteSubscription(subscriptionTreeItem.subscription)));
	context.subscriptions.push(vscode.commands.registerCommand('subscriptions.view', (subscription: Subscription) => topicService.viewSubscription(subscription)));
	
	context.subscriptions.push(vscode.commands.registerCommand('rules.refresh', (ruleTreeItem: RuleTreeItem) => topicService.refreshRule(ruleTreeItem.rule)));
	context.subscriptions.push(vscode.commands.registerCommand('rules.create', (subscriptionTreeItem: SubscriptionTreeItem) => topicService.createRule(subscriptionTreeItem.subscription)));
	context.subscriptions.push(vscode.commands.registerCommand('rules.delete', (ruleTreeItem: RuleTreeItem) => topicService.deleteRule(ruleTreeItem.rule)));
	context.subscriptions.push(vscode.commands.registerCommand('rules.view', (rule: Rule) => topicService.viewRule(rule)));
}

// this method is called when your extension is deactivated
export function deactivate() {}
