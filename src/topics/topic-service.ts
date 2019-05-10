import * as vscode from 'vscode';
import { Azure } from 'azure-sb';
import CreateTopicOptions = Azure.ServiceBus.CreateTopicOptions;
import CreateSubscriptionOptions = Azure.ServiceBus.CreateSubscriptionOptions;
import CreateRuleOptions = Azure.ServiceBus.CreateRuleOptions;
import { TopicTreeDataProvider, TopicTreeItem, SubscriptionTreeItem, RuleTreeItem } from './topic-provider';
import { ServiceBusWebviewPanel } from '../service-bus/service-bus-webview-panel';
import { ServiceBusApi } from '../service-bus/service-bus-api';
import { ServiceBusNamespace, Topic, ServiceBusEntityType, Subscription, Rule, Message } from '../service-bus/service-bus-models';
import { TopicUtilities } from './topic-utilities';
import { ServiceBusUtilities } from '../service-bus/service-bus-utilities';

/**
 * Tree Service
 * Handles VSCode commands associated with topic entities (topics, subscriptions, rules)
 */
export class TopicService {
	treeDataProvider: TopicTreeDataProvider;

	constructor(
		private serviceBusNamespace: ServiceBusNamespace,
		private serviceBusApi: ServiceBusApi,
		private webviewPanel: ServiceBusWebviewPanel) {

		this.listTopics();
		this.treeDataProvider = new TopicTreeDataProvider(this.serviceBusNamespace);
		this.treeDataProvider.refresh();
	}

	/**
	 * Retrieves all topics
	 */
	listTopics() {
		vscode.window.withProgress({
			title: `Loading Topics`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// gets the topics
				let topics = <Topic[]>await this.serviceBusApi.listTopics({});
				topics.forEach(t => t.TopicTreeItem = new TopicTreeItem(t));
				this.serviceBusNamespace.topics = topics;
				
				// update UI
				this.webviewPanel.refreshWebview(ServiceBusEntityType.Topic, ...topics);
				this.treeDataProvider.refresh();

				// refresh all subscriptions of that topic
				topics.forEach(t => this.listSubscriptions(t));
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Refreshes a topic
	 * @param topic The topic that needs refreshing
	 */
	refreshTopic(topic: Topic) {
		vscode.window.withProgress({
			title: `Refreshing '${topic.TopicName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				let refreshedTopic = <Topic>await this.serviceBusApi.getTopic(topic.TopicName);
				refreshedTopic.TopicTreeItem = new TopicTreeItem(refreshedTopic);
				let topicIndex = this.serviceBusNamespace.topics.findIndex(t => t.TopicName === topic.TopicName);
				if (topicIndex > -1) {
					this.serviceBusNamespace.topics.splice(topicIndex, 1, refreshedTopic);
				}

				// update UI
				this.webviewPanel.refreshWebview(ServiceBusEntityType.Topic, refreshedTopic);
				this.treeDataProvider.refresh();

				// refresh all subscriptions of that topic
				this.listSubscriptions(refreshedTopic);
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Creates a topic
	 */
	async createTopic() {
		try {
			// prompt for topic name and topic options, then create topic
			let topicName = await ServiceBusUtilities.showCreateNameInput(this.serviceBusNamespace.topics.map(t => t.TopicName), ServiceBusEntityType.Topic);
			let topicCreateOptions = TopicUtilities.getDefaultTopicCreateOptions();
			let createTopicOptions = await ServiceBusUtilities.showCreateOptionsSelector<CreateTopicOptions>(topicCreateOptions, topicName, ServiceBusEntityType.Topic);

			await this.sendCreateTopicRequest(topicName, createTopicOptions);
		} catch (error) {
			console.warn('Topic not created.', error);
		}
	}

	/**
	 * Sends the create topic api request
	 * @param topicName The name of the topic to create
	 * @param topicCreateOptions The topic creation options
	 */
	private sendCreateTopicRequest(topicName: string, topicCreateOptions: CreateTopicOptions) {
		vscode.window.withProgress({
			title: `Creating '${topicName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// create topic
				let createdTopic = <Topic>await this.serviceBusApi.createTopic(<string>topicName, topicCreateOptions);
				createdTopic.TopicTreeItem = new TopicTreeItem(createdTopic);

				// put topic into the in memory list
				this.serviceBusNamespace.topics.push(createdTopic);

				// update UI
				this.treeDataProvider.refresh();
				vscode.window.showInformationMessage(`'${createdTopic.TopicName}' created successfully`);
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Deletes a topic
	 * @param topic The topic to delete
	 */
	async deleteTopic(topic: Topic) {
		try {
			// show a confirm delete dialog and delete the topic if the user confirms
			let confirmDelete = await ServiceBusUtilities.showConfirmDelete(topic.TopicName, ServiceBusEntityType.Topic);
			if (confirmDelete) {
				await this.sendDeleteTopicRequest(topic);
			}
		} catch (error) {
			console.warn(`Did not delete topic '${topic.TopicName}'.`, error);
		}
	}

	/**
	 * Sends the delete topic api request
	 * @param topic The topic to delete
	 */
	private async sendDeleteTopicRequest(topic: Topic) {
		return vscode.window.withProgress({
			title: `Deleting '${topic.TopicName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// delete topic
				await this.serviceBusApi.deleteTopic(topic.TopicName);

				// spice topic out of the list
				let topicIndex = this.serviceBusNamespace.topics.findIndex(t => t.TopicName === topic.TopicName);
				if (topicIndex > -1) {
					this.serviceBusNamespace.topics.splice(topicIndex, 1);
				}
				
				// update UI
				this.webviewPanel.closeWebviewForEntity(topic);
				this.treeDataProvider.refresh();
				vscode.window.showInformationMessage(`'${topic.TopicName}' deleted successfully`);
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Displays a topic
	 * @param topic The topic to view
	 */
	viewTopic(topic: Topic) {
		this.webviewPanel.showEntity(ServiceBusEntityType.Topic, topic);
	}
	
	async sendTopicMessage(topic: Topic, message: Message) {
		vscode.window.withProgress({
			title: `Sending Message to '${topic.TopicName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				await this.serviceBusApi.sendTopicMessage(topic, message);
				vscode.window.showInformationMessage(`Message sent to '${topic.TopicName}' successfully`);
			} catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);				
			}
		});
	}


	/**
	 * Retreives all subscriptions associated with a topic
	 * @param topic The topic that ths subscriptions belong to
	 */
	listSubscriptions(topic: Topic) {
		vscode.window.withProgress({
			title: `Loading Subscriptions for '${topic.TopicName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// gets the subscriptions belonging to the topic
				let subscriptionsForTopic = <Subscription[]>await this.serviceBusApi.listSubscriptions(topic.TopicName, {});
				subscriptionsForTopic.forEach(s => s.SubscriptionTreeItem = new SubscriptionTreeItem(s));

				// filter out existing subscriptions belonging to the topic and push on the updated subscriptions
				this.serviceBusNamespace.subscriptions = this.serviceBusNamespace.subscriptions.filter(s => s.TopicName !== topic.TopicName);
				this.serviceBusNamespace.subscriptions.push(...subscriptionsForTopic);

				// update UI
				this.webviewPanel.refreshWebview(ServiceBusEntityType.Subscription, ...subscriptionsForTopic);
				this.treeDataProvider.refresh();

				// refresh all rules that belong to the subscription
				subscriptionsForTopic.forEach(s => this.listRules(s));
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Refreshes a subscription
	 * @param subscription The subscription that needs refreshing
	 */
	refreshSubscription(subscription: Subscription) {
		vscode.window.withProgress({
			title: `Refreshing '${subscription.SubscriptionName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// refresh subscription
				let refreshedSubscription = <Subscription>await this.serviceBusApi.getSubscription(subscription.TopicName, subscription.SubscriptionName);
				refreshedSubscription.SubscriptionTreeItem = new SubscriptionTreeItem(refreshedSubscription);

				// splice in refreshed subscription
				let subscriptionIndex = this.serviceBusNamespace.subscriptions.findIndex(s => s.TopicName === subscription.TopicName && s.SubscriptionName === subscription.SubscriptionName);
				if (subscriptionIndex > -1) {
					this.serviceBusNamespace.subscriptions.splice(subscriptionIndex, 1, refreshedSubscription);
				}

				// update UI
				this.webviewPanel.refreshWebview(ServiceBusEntityType.Subscription, refreshedSubscription);
				this.treeDataProvider.refresh();

				// refresh all rules that belong to the subscription
				this.listRules(refreshedSubscription);
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Creates a subscription
	 * @param topic The topic that the subscription should belong to
	 */
	async createSubscription(topic: Topic) {
		try {
			// prompt for subscription name and subscription options, then create subscription
			let subscriptionName = await ServiceBusUtilities.showCreateNameInput(this.serviceBusNamespace.subscriptions.filter(s => s.TopicName === topic.TopicName).map(s => s.SubscriptionName), ServiceBusEntityType.Subscription);
			let subscriptionCreateOptions = TopicUtilities.getDefaultSubscriptionCreateOptions();
			let createSubscriptionOptions = await ServiceBusUtilities.showCreateOptionsSelector<CreateTopicOptions>(subscriptionCreateOptions, subscriptionName, ServiceBusEntityType.Subscription);

			await this.sendCreateSubscriptionRequest(topic.TopicName, subscriptionName, createSubscriptionOptions);
		} catch (error) {
			console.warn('Subscription not created.', error);
		}
	}

	/**
	 * Sends the create subscription api request
	 * @param topicName The topic that the subscription should belong to
	 * @param subscriptionName The name of the subscription to create
	 * @param subscriptionCreateOptions The subscription creation options
	 */
	private sendCreateSubscriptionRequest(topicName: string, subscriptionName: string, subscriptionCreateOptions: CreateSubscriptionOptions) {
		vscode.window.withProgress({
			title: `Creating '${subscriptionName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// create subscription
				let createdSubscription = <Subscription>await this.serviceBusApi.createSubscription(topicName, subscriptionName, subscriptionCreateOptions);
				createdSubscription.SubscriptionTreeItem = new SubscriptionTreeItem(createdSubscription);
				
				// put the subscription into the in memory list
				this.serviceBusNamespace.subscriptions.push(createdSubscription);

				// update UI
				this.treeDataProvider.refresh();
				vscode.window.showInformationMessage(`'${createdSubscription.SubscriptionName}' created successfully`);
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Deletes a subscription
	 * @param subscription The subscription to delete
	 */
	async deleteSubscription(subscription: Subscription) {
		try {
			let confirmDelete = await ServiceBusUtilities.showConfirmDelete(subscription.SubscriptionName, ServiceBusEntityType.Subscription);
			if (confirmDelete) {
				await this.sendDeleteSubscriptionRequest(subscription);
			}
		} catch (error) {
			console.warn(`Did not delete subscription '${subscription.SubscriptionName}'.`, error);
		}
	}
	
	/**
	 * Sends the delete subscription api request
	 * @param subscription The subscription to delete
	 */
	private async sendDeleteSubscriptionRequest(subscription: Subscription) {
		return vscode.window.withProgress({
			title: `Deleting '${subscription.SubscriptionName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// delete subscription
				await this.serviceBusApi.deleteSubscription(subscription.TopicName, subscription.SubscriptionName);

				// spice subscription out of the list
				let subscriptionIndex = this.serviceBusNamespace.subscriptions.findIndex(s => s.TopicName === subscription.TopicName && s.SubscriptionName === subscription.SubscriptionName);
				if (subscriptionIndex > -1) {
					this.serviceBusNamespace.subscriptions.splice(subscriptionIndex, 1);
				}
				
				// update UI
				this.webviewPanel.closeWebviewForEntity(subscription);
				this.treeDataProvider.refresh();
				vscode.window.showInformationMessage(`'${subscription.SubscriptionName}' deleted successfullly`);
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Displays a subscription
	 * @param subscription The subscription to view
	 */
	viewSubscription(subscription: Subscription) {
		this.webviewPanel.showEntity(ServiceBusEntityType.Subscription, subscription);
	}

	/**
	 * Peeks messages from a subscription
	 * @param subscription The subscription
	 * @param count The number of messages to peek
	 */
	async peekSubscriptionMessages(subscription: Subscription, count?: number) {
		vscode.window.withProgress({
			title: `Peeking ${count !== undefined ? count + ' ': ''}message${count === 1 ? '' : 's'} from '${subscription.SubscriptionName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				let messages = await this.serviceBusApi.peekSubscriptionMessages(subscription, count);
				this.webviewPanel.updateMessages(ServiceBusEntityType.Subscription, subscription, messages);
			} catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);				
			}
		});
	}


	/**
	 * Retrieves all rules associated with a subscription
	 * @param subscription The subscription that the rules belong to
	 */
	listRules(subscription: Subscription) {
		vscode.window.withProgress({
			title: `Loading Rules for '${subscription.SubscriptionName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// get the subscriptions
				let rulesForSubscription = <Rule[]>await this.serviceBusApi.listRules(subscription.TopicName, subscription.SubscriptionName, {});
				rulesForSubscription.forEach(r => r.RuleTreeItem = new RuleTreeItem(r));

				// filter out existing rules that belong to the subscription and add the refreshed ones
				this.serviceBusNamespace.rules = this.serviceBusNamespace.rules.filter(r => !(r.TopicName === subscription.TopicName && r.SubscriptionName === subscription.SubscriptionName));
				this.serviceBusNamespace.rules.push(...rulesForSubscription);

				// update UI
				this.webviewPanel.refreshWebview(ServiceBusEntityType.Rule, ...rulesForSubscription);
				this.treeDataProvider.refresh();
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Refreshes a rule
	 * @param rule The rule that needs to be refreshed
	 */
	refreshRule(rule: Rule) {
		vscode.window.withProgress({
			title: `Refreshing '${rule.RuleName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// refresh rule
				let refreshedRule = <Rule>await this.serviceBusApi.getRule(rule.TopicName, rule.SubscriptionName, rule.RuleName);
				refreshedRule.RuleTreeItem = new RuleTreeItem(refreshedRule);

				// splice in refreshed rule
				let ruleIndex = this.serviceBusNamespace.rules.findIndex(r => r.TopicName === rule.TopicName && r.SubscriptionName === rule.SubscriptionName && r.RuleName === rule.RuleName);
				if (ruleIndex > -1) {
					this.serviceBusNamespace.rules.splice(ruleIndex, 1, refreshedRule);
				}

				// update UI
				this.webviewPanel.refreshWebview(ServiceBusEntityType.Rule, refreshedRule);
				this.treeDataProvider.refresh();
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}
	
	/**
	 * 
	 * @param subscription The subscription that the rule belongs to
	 */
	async createRule(subscription: Subscription) {
		try {
			// prompt for rule name and rule options, then create rule
			let ruleName = await ServiceBusUtilities.showCreateNameInput(this.serviceBusNamespace.rules.filter(r => r.TopicName === subscription.TopicName && r.SubscriptionName === subscription.SubscriptionName).map(r => r.RuleName), ServiceBusEntityType.Rule);
			let ruleCreateOptions = TopicUtilities.getDefaultRuleCreateOptions();
			let createRuleOptions = await ServiceBusUtilities.showCreateOptionsSelector<CreateRuleOptions>(ruleCreateOptions, ruleName, ServiceBusEntityType.Rule);

			await this.sendCreateRuleRequest(subscription.TopicName, subscription.SubscriptionName, ruleName, createRuleOptions);
		} catch (error) {
			console.warn('Subscription not created.', error);
		}
	}

	/**
	 * Sends the create rule api request
	 * @param topicName The topic name
	 * @param subscriptionName The subscription name
	 * @param ruleName The rule name
	 * @param ruleCreateOptions The rule create options
	 */
	private sendCreateRuleRequest(topicName: string, subscriptionName: string, ruleName: string, ruleCreateOptions: CreateRuleOptions) {
		vscode.window.withProgress({
			title: `Creating '${ruleName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// create rule
				let createdRule = <Rule>await this.serviceBusApi.createRule(topicName, subscriptionName, ruleName, ruleCreateOptions);
				createdRule.RuleTreeItem = new RuleTreeItem(createdRule);

				// push rule into the in memory list
				this.serviceBusNamespace.rules.push(createdRule);

				// update UI
				this.treeDataProvider.refresh();
				vscode.window.showInformationMessage(`'${createdRule.RuleName}' created successfully`);
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Deletes a rule
	 * @param rule The rule to delete
	 */
	async deleteRule(rule: Rule) {
		try {
			// show a confirm delete dialog and delete the rule if the user confirms
			let confirmDelete = await ServiceBusUtilities.showConfirmDelete(rule.RuleName, ServiceBusEntityType.Rule);
			if (confirmDelete) {
				await this.sendDeleteRuleRequest(rule);
			}
		} catch (e) {
			console.warn(`Did not delete rule '${rule.RuleName}'.`, e);
		}
	}

	/**
	 * Sends the delete rule api request
	 * @param rule The rule to delete
	 */
	private async sendDeleteRuleRequest(rule: Rule) {
		return vscode.window.withProgress({
			title: `Deleting '${rule.RuleName}'`,
			location: vscode.ProgressLocation.Window
		}, async (progress, token) => {
			try {
				// delete rule
				await this.serviceBusApi.deleteRule(rule.TopicName, rule.SubscriptionName, rule.RuleName);
				
				// splice rule out of list
				let ruleIndex = this.serviceBusNamespace.rules.findIndex(r => r.TopicName === rule.TopicName && r.SubscriptionName === rule.SubscriptionName && r.RuleName === rule.RuleName);
				if (ruleIndex > -1) {
					this.serviceBusNamespace.rules.splice(ruleIndex, 1);
				}

				// update UI
				this.webviewPanel.closeWebviewForEntity(rule);
				this.treeDataProvider.refresh();
				vscode.window.showInformationMessage(`'${rule.RuleName}' deleted successfullly`);
			}
			catch (error) {
				console.warn(error);
				vscode.window.showErrorMessage(error.message);
			}
		});
	}

	/**
	 * Displays a rule
	 * @param rule The rule to view
	 */
	viewRule(rule: Rule) {
		this.webviewPanel.showEntity(ServiceBusEntityType.Rule, rule);
	}
}