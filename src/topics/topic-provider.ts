import * as vscode from 'vscode';

import * as path from 'path';
import { ServiceBusNamespace, Topic, Subscription, Rule } from '../service-bus/service-bus-models';

// Type for all topic entities
type TreeItems = TopicTreeItem | SubscriptionTreeItem | RuleTreeItem;

/**
 * Tree Data Provider for Topic Entities
 */
export class TopicTreeDataProvider implements vscode.TreeDataProvider<TreeItems> {

	private _onDidChangeTreeData: vscode.EventEmitter<TreeItems | undefined> = new vscode.EventEmitter<TreeItems | undefined>();
	readonly onDidChangeTreeData: vscode.Event<TreeItems | undefined> = this._onDidChangeTreeData.event;

	constructor(private serviceBusNamespace: ServiceBusNamespace) { }

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: TreeItems): vscode.TreeItem {
		return element;
	}

	getChildren(element?: TreeItems): Thenable<TreeItems[]> {
		let children: TreeItems[] = [];
		if (!element) {
			let topicChildren = this.serviceBusNamespace.topics
				.sort((a, b) => (a.TopicName.localeCompare(b.TopicName)))
				.map(t => t.TopicTreeItem);
			topicChildren.forEach(t => t.collapsibleState = this.serviceBusNamespace.subscriptions.some(s => s.TopicName === t.topic.TopicName) ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
			children = topicChildren;
		} else if (element instanceof TopicTreeItem) {
			let subscriptionChildren = this.serviceBusNamespace.subscriptions
				.filter(s => s.TopicName === element.topic.TopicName)
				.sort((a, b) => (a.SubscriptionName.localeCompare(b.SubscriptionName)))
				.map(s => s.SubscriptionTreeItem);
			subscriptionChildren.forEach(s => s.collapsibleState = this.serviceBusNamespace.rules.some(r => r.TopicName === s.subscription.TopicName && r.SubscriptionName === s.subscription.SubscriptionName) ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None);
			children = subscriptionChildren;
		} else if (element instanceof SubscriptionTreeItem) {
			children = this.serviceBusNamespace.rules
				.filter(r => r.TopicName === element.subscription.TopicName && r.SubscriptionName === element.subscription.SubscriptionName)
				.sort((a, b) => (a.RuleName.localeCompare(b.RuleName)))
				.map(r => r.RuleTreeItem);
		}

		return Promise.resolve(children);
	}
}

/**
 * Topic Tree Item
 */
export class TopicTreeItem extends vscode.TreeItem {
	constructor(public topic: Topic) {
		super(topic.TopicName, vscode.TreeItemCollapsibleState.Collapsed);
		this.topic = { ...topic };
		this.command = {
				command: 'topics.view',
				title: 'View Topic',
				arguments: [
					this.topic
				]
			};
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'light', 'azure-service-bus-topic.svg'),
		dark: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'dark', 'azure-service-bus-topic.svg')
	};

	contextValue = 'topic';
}

/**
 * Subscription Tree Item
 */
export class SubscriptionTreeItem extends vscode.TreeItem {
	constructor(public subscription: Subscription) {
		super(subscription.SubscriptionName, vscode.TreeItemCollapsibleState.Collapsed);
		this.subscription = { ...subscription };
		this.command = {
				command: 'subscriptions.view',
				title: 'View Subscription',
				arguments: [
					this.subscription
				]
			};
	}

	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'light', 'azure-service-bus-subscription.svg'),
		dark: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'dark', 'azure-service-bus-subscription.svg')
	};

	contextValue = 'subscription';
}

/**
 * Rule Tree Item
 */
export class RuleTreeItem extends vscode.TreeItem {
	constructor(public rule: Rule) {
		super(rule.RuleName, vscode.TreeItemCollapsibleState.None);
		this.rule = { ...rule };
		this.command = {
				command: 'rules.view',
				title: 'View Rule',
				arguments: [
					this.rule
				]
			};
	}
	iconPath = {
		light: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'light', 'azure-service-bus-rule.svg'),
		dark: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'dark', 'azure-service-bus-rule.svg')
	};

	contextValue = 'rule';

}