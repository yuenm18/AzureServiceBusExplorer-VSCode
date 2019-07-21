import { ServiceBusService, Azure } from 'azure-sb';
import { ServiceBusClient, SendableMessageInfo, QueueClient, ReceiveMode, SubscriptionClient } from '@azure/service-bus';

import Queue = Azure.ServiceBus.Results.Models.Queue;
import Topic = Azure.ServiceBus.Results.Models.Topic;
import Subscription = Azure.ServiceBus.Results.Models.Subscription;
import Rule = Azure.ServiceBus.Results.Models.Rule;
import CreateQueueOptions = Azure.ServiceBus.CreateQueueOptions;
import CreateTopicOptions = Azure.ServiceBus.CreateTopicOptions;
import CreateSubscriptionOptions = Azure.ServiceBus.CreateSubscriptionOptions;
import CreateRuleOptions = Azure.ServiceBus.CreateRuleOptions;
import ListQueuesOptions = Azure.ServiceBus.ListQueuesOptions;
import ListTopicsOptions = Azure.ServiceBus.ListTopicsOptions;
import ListSubscriptionsOptions = Azure.ServiceBus.ListSubscriptionsOptions;
import ListRulesOptions = Azure.ServiceBus.ListRulesOptions;

/**
 * Api methods for ineracting with the service bus
 */
export class ServiceBusApi {
    private serviceBusService: ServiceBusService;
    private serviceBusClient: ServiceBusClient;

    constructor(connectionString: string) {
        this.serviceBusService = new ServiceBusService(connectionString);
        this.serviceBusClient = ServiceBusClient.createFromConnectionString(connectionString);
    }

    /*
     * Queue Management functions
     */

    public createQueue(queuePath: string, options: CreateQueueOptions): Promise<Queue> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.createQueue(queuePath, options, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public deleteQueue(queuePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.deleteQueue(queuePath, (error, response) => {
                if (error) {
                    return reject(error);
                }

                resolve();
            });
        });
    }

    public getQueue(queuePath: string): Promise<Queue> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.getQueue(queuePath, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public listQueues(options: ListQueuesOptions): Promise<Queue[]> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.listQueues(options, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    /*
     * Topic Management functions
     */


    public createTopic(topicPath: string, options: CreateTopicOptions): Promise<Topic> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.createTopic(topicPath, options, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public deleteTopic(topicPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.deleteTopic(topicPath, (error, response) => {
                if (error) {
                    return reject(error);
                }

                resolve();
            });
        });
    }

    public getTopic(topicPath: string): Promise<Topic> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.getTopic(topicPath, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public listTopics(options: ListTopicsOptions): Promise<Topic[]> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.listTopics(options, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    /*
     * Subscription functions
     */

    public createSubscription(topicPath: string, subscriptionPath: string, options: CreateSubscriptionOptions): Promise<Subscription> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.createSubscription(topicPath, subscriptionPath, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public deleteSubscription(topicPath: string, subscriptionPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.deleteSubscription(topicPath, subscriptionPath, (error, response) => {
                if (error) {
                    return reject(error);
                }

                resolve();
            });
        });
    }

    public getSubscription(topicPath: string, subscriptionPath: string): Promise<Subscription> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.getSubscription(topicPath, subscriptionPath, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public listSubscriptions(topicPath: string, options: ListSubscriptionsOptions): Promise<Subscription[]> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.listSubscriptions(topicPath, options, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    /*
     * Rule functions
     */

    public createRule(topicPath: string, subscriptionPath: string, rulePath: string, options: CreateRuleOptions): Promise<Rule> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.createRule(topicPath, subscriptionPath, rulePath, options, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public deleteRule(topicPath: string, subscriptionPath: string, rulePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.deleteRule(topicPath, subscriptionPath, rulePath, (error, response) => {
                if (error) {
                    return reject(error);
                }

                resolve();
            });
        });
    }

    public getRule(topicPath: string, subscriptionPath: string, rulePath: string): Promise<Rule> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.getRule(topicPath, subscriptionPath, rulePath, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public listRules(topicPath: string, subscriptionPath: string, options: ListRulesOptions): Promise<Rule[]> {
        return new Promise((resolve, reject) => {
            this.serviceBusService.listRules(topicPath, subscriptionPath, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    /*
     * Message functions
     */

    public async sendQueueMessage(queue: Queue, message: SendableMessageInfo): Promise<void> {
        const queueClient = this.serviceBusClient.createQueueClient(queue.QueueName);
        const sender = queueClient.createSender();
        await sender.send(message);
        await queueClient.close();
    }

    public async peekQueueMessages(queue: Queue, count = +queue.MessageCount): Promise<SendableMessageInfo[]> {
        const queueClient = this.serviceBusClient.createQueueClient(queue.QueueName);
        const messages = await queueClient.peek(count);
        await queueClient.close();
        return messages;
    }

    public async peekQueueDeadLetterMessages(queue: Queue, count = +queue.MessageCount): Promise<SendableMessageInfo[]> {
        const deadLetterQueueName = QueueClient.getDeadLetterQueuePath(queue.QueueName);
        const queueClient = this.serviceBusClient.createQueueClient(deadLetterQueueName);
        const messages = await queueClient.peek(count);
        await queueClient.close();
        return messages;
    }

    public async purgeQueueMessages(queue: Queue, count = +queue.MessageCount): Promise<void> {
        const queueClient = this.serviceBusClient.createQueueClient(queue.QueueName);
        const receiver = queueClient.createReceiver(ReceiveMode.receiveAndDelete);
        await receiver.receiveMessages(count);
        await queueClient.close();
    }

    public async purgeQueueDeadLetterMessages(queue: Queue, count = +queue.MessageCount): Promise<void> {
        const deadLetterQueueName = QueueClient.getDeadLetterQueuePath(queue.QueueName);
        const queueClient = this.serviceBusClient.createQueueClient(deadLetterQueueName);
        const receiver = queueClient.createReceiver(ReceiveMode.receiveAndDelete);
        await receiver.receiveMessages(count);
        await queueClient.close();
    }

    public async sendTopicMessage(topic: Topic, message: SendableMessageInfo): Promise<void> {
        const topicClient = this.serviceBusClient.createTopicClient(topic.TopicName);
        const sender = topicClient.createSender();
        await sender.send(message);
        await topicClient.close();
    }

    public async peekSubscriptionMessages(subscription: Subscription, count = Number.MAX_VALUE): Promise<SendableMessageInfo[]> {
        const subscriptionClient = this.serviceBusClient.createSubscriptionClient(subscription.TopicName, subscription.SubscriptionName);
        const messages = await subscriptionClient.peek(count);
        await subscriptionClient.close();
        return messages;
    }

    public async peekSubscriptionDeadLetterMessages(subscription: Subscription, count = Number.MAX_VALUE): Promise<SendableMessageInfo[]> {
        const deadLetterQueueName = QueueClient.getDeadLetterQueuePath(subscription.SubscriptionName);
        const subscriptionClient = this.serviceBusClient.createSubscriptionClient(subscription.TopicName, deadLetterQueueName);
        const messages = await subscriptionClient.peek(count);
        await subscriptionClient.close();
        return messages;
    }

    public async purgeSubscriptionMessages(subscription: Subscription, count = Number.MAX_VALUE): Promise<void> {
        const subscriptionClient = this.serviceBusClient.createSubscriptionClient(subscription.TopicName, subscription.SubscriptionName);
        const receiver = subscriptionClient.createReceiver(ReceiveMode.receiveAndDelete);
        await receiver.receiveMessages(count);
        await subscriptionClient.close();
    }

    public async purgeSubscriptionDeadLetterMessages(subscription: Subscription, count = Number.MAX_VALUE): Promise<void> {
        const deadLetterQueueName = QueueClient.getDeadLetterQueuePath(subscription.SubscriptionName);
        const subscriptionClient = this.serviceBusClient.createSubscriptionClient(subscription.SubscriptionName, deadLetterQueueName);
        const receiver = subscriptionClient.createReceiver(ReceiveMode.receiveAndDelete);
        await receiver.receiveMessages(count);
        await subscriptionClient.close();
    }
}