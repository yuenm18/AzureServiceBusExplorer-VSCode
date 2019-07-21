import * as vscode from 'vscode';
import { ServiceBusManager } from './service-bus/service-bus-manager';
import { QueueTreeItem } from './queues/queue-provider';
import { Queue, Topic, Subscription, Rule, Message } from './service-bus/service-bus-models';
import { TopicTreeItem, SubscriptionTreeItem, RuleTreeItem } from './topics/topic-provider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let serviceBusManager = new ServiceBusManager(context);
	let queueService = serviceBusManager.queueService;
	let topicService = serviceBusManager.topicService;

	context.subscriptions.push(vscode.window.registerTreeDataProvider('queues', queueService.treeDataProvider));
	context.subscriptions.push(vscode.commands.registerCommand('queues.loadAll', () => queueService.listQueues()));
	context.subscriptions.push(vscode.commands.registerCommand('queues.refresh', (queueTreeItem: QueueTreeItem) => queueService.refreshQueue(queueTreeItem.queue)));
	context.subscriptions.push(vscode.commands.registerCommand('queues.create', () => queueService.createQueue()));
	context.subscriptions.push(vscode.commands.registerCommand('queues.delete', (queueTreeItem: QueueTreeItem) => queueService.deleteQueue(queueTreeItem.queue)));
	context.subscriptions.push(vscode.commands.registerCommand('queues.view', (queue: Queue) => queueService.viewQueue(queue)));
	context.subscriptions.push(vscode.commands.registerCommand('queues.send', async (queue: Queue, message: Message) => await queueService.sendQueueMessage(queue, message)));
	context.subscriptions.push(vscode.commands.registerCommand('queues.peek', async (queue: Queue, count?: number) => await queueService.peekQueueMessages(queue, count)));
	context.subscriptions.push(vscode.commands.registerCommand('queues.peekDeadLetter', async (queue: Queue, count?: number) => await queueService.peekQueueDeadLetterMessages(queue, count)));

	context.subscriptions.push(vscode.window.registerTreeDataProvider('topics', topicService.treeDataProvider));
	context.subscriptions.push(vscode.commands.registerCommand('topics.loadAll', () => topicService.listTopics()));
	context.subscriptions.push(vscode.commands.registerCommand('topics.refresh', (topicTreeItem: TopicTreeItem) => topicService.refreshTopic(topicTreeItem.topic)));
	context.subscriptions.push(vscode.commands.registerCommand('topics.create', () => topicService.createTopic()));
	context.subscriptions.push(vscode.commands.registerCommand('topics.delete', (topicTreeItem: TopicTreeItem) => topicService.deleteTopic(topicTreeItem.topic)));
	context.subscriptions.push(vscode.commands.registerCommand('topics.view', (topic: Topic) => topicService.viewTopic(topic)));
	context.subscriptions.push(vscode.commands.registerCommand('topics.send', (topic: Topic, message: Message) => topicService.sendTopicMessage(topic, message)));
	
	context.subscriptions.push(vscode.commands.registerCommand('subscriptions.refresh', (subscriptionTreeItem: SubscriptionTreeItem) => topicService.refreshSubscription(subscriptionTreeItem.subscription)));
	context.subscriptions.push(vscode.commands.registerCommand('subscriptions.create', (topicTreeItem: TopicTreeItem) => topicService.createSubscription(topicTreeItem.topic)));
	context.subscriptions.push(vscode.commands.registerCommand('subscriptions.delete', (subscriptionTreeItem: SubscriptionTreeItem) => topicService.deleteSubscription(subscriptionTreeItem.subscription)));
	context.subscriptions.push(vscode.commands.registerCommand('subscriptions.view', (subscription: Subscription) => topicService.viewSubscription(subscription)));
	context.subscriptions.push(vscode.commands.registerCommand('subscriptions.peek', (subscription: Subscription, count?: number) => topicService.peekSubscriptionMessages(subscription, count)));
	context.subscriptions.push(vscode.commands.registerCommand('subscriptions.peekDeadLetter', (subscription: Subscription, count?: number) => topicService.peekSubscriptionDeadLetterMessages(subscription, count)));
	
	context.subscriptions.push(vscode.commands.registerCommand('rules.refresh', (ruleTreeItem: RuleTreeItem) => topicService.refreshRule(ruleTreeItem.rule)));
	context.subscriptions.push(vscode.commands.registerCommand('rules.create', (subscriptionTreeItem: SubscriptionTreeItem) => topicService.createRule(subscriptionTreeItem.subscription)));
	context.subscriptions.push(vscode.commands.registerCommand('rules.delete', (ruleTreeItem: RuleTreeItem) => topicService.deleteRule(ruleTreeItem.rule)));
	context.subscriptions.push(vscode.commands.registerCommand('rules.view', (rule: Rule) => topicService.viewRule(rule)));

	context.subscriptions.push(vscode.commands.registerCommand('servicebus.changeConnectionString', async () => await serviceBusManager.updateDefaultConnectionString()));

	let changeConnectionString = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 0);
	context.subscriptions.push(changeConnectionString);
	changeConnectionString.command = 'servicebus.changeConnectionString';
	changeConnectionString.text = 'Change Service Bus Connection';
	changeConnectionString.show();
}

// this method is called when your extension is deactivated
export function deactivate() {}
