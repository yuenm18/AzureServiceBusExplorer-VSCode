import { ServiceBusService, Azure } from 'azure-sb';

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
 * Promise wrapper for some methods from sb-azure library
 */
export class ServiceBusServicePromise extends ServiceBusService {

    /*
     * Queue Management functions
     */


    public createQueuePromise(queuePath: string, options: CreateQueueOptions): Promise<Queue> {
        return new Promise((resolve, reject) => {
            this.createQueue(queuePath, options, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public deleteQueuePromise(queuePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.deleteQueue(queuePath, (error, response) => {
                if (error) {
                    return reject(error);
                }

                resolve();
            });
        });
    }

    public getQueuePromise(queuePath: string): Promise<Queue> {
        return new Promise((resolve, reject) => {
            this.getQueue(queuePath, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public listQueuesPromise(options: ListQueuesOptions): Promise<Queue[]> {
        return new Promise((resolve, reject) => {
            this.listQueues(options, (error, result, response) => {
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


    public createTopicPromise(topicPath: string, options: CreateTopicOptions): Promise<Topic> {
        return new Promise((resolve, reject) => {
            this.createTopic(topicPath, options, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public deleteTopicPromise(topicPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.deleteTopic(topicPath, (error, response) => {
                if (error) {
                    return reject(error);
                }

                resolve();
            });
        });
    }

    public getTopicPromise(topicPath: string): Promise<Topic> {
        return new Promise((resolve, reject) => {
            this.getTopic(topicPath, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public listTopicsPromise(options: ListTopicsOptions): Promise<Topic[]> {
        return new Promise((resolve, reject) => {
            this.listTopics(options, (error, result, response) => {
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

    public createSubscriptionPromise(topicPath: string, subscriptionPath: string, options: CreateSubscriptionOptions): Promise<Subscription> {
        return new Promise((resolve, reject) => {
            this.createSubscription(topicPath, subscriptionPath, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public deleteSubscriptionPromise(topicPath: string, subscriptionPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.deleteSubscription(topicPath, subscriptionPath, (error, response) => {
                if (error) {
                    return reject(error);
                }

                resolve();
            });
        });
    }

    public getSubscriptionPromise(topicPath: string, subscriptionPath: string): Promise<Subscription> {
        return new Promise((resolve, reject) => {
            this.getSubscription(topicPath, subscriptionPath, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public listSubscriptionsPromise(topicPath: string, options: ListSubscriptionsOptions): Promise<Subscription[]> {
        return new Promise((resolve, reject) => {
            this.listSubscriptions(topicPath, options, (error, result, response) => {
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

    public createRulePromise(topicPath: string, subscriptionPath: string, rulePath: string, options: CreateRuleOptions): Promise<Rule> {
        return new Promise((resolve, reject) => {
            this.createRule(topicPath, subscriptionPath, rulePath, options, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public deleteRulePromise(topicPath: string, subscriptionPath: string, rulePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.deleteRule(topicPath, subscriptionPath, rulePath, (error, response) => {
                if (error) {
                    return reject(error);
                }

                resolve();
            });
        });
    }

    public getRulePromise(topicPath: string, subscriptionPath: string, rulePath: string): Promise<Rule> {
        return new Promise((resolve, reject) => {
            this.getRule(topicPath, subscriptionPath, rulePath, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }

    public listRulesPromise(topicPath: string, subscriptionPath: string, options: ListRulesOptions): Promise<Rule[]> {
        return new Promise((resolve, reject) => {
            this.listRules(topicPath, subscriptionPath, (error, result, response) => {
                if (error) {
                    return reject(error);
                }

                resolve(result);
            });
        });
    }
}