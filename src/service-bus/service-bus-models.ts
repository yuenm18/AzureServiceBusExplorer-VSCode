import { Azure } from 'azure-sb';
import { QueueTreeItem } from '../queues/queue-provider';
import { TopicTreeItem, SubscriptionTreeItem, RuleTreeItem } from '../topics/topic-provider';

export class ServiceBusNamespace {
    constructor(
        public connectionString: string,
        public topics: Topic[] = [],
        public queues: Queue[] = [],
        public subscriptions: Subscription[] = [],
        public rules: Rule[] = []
    ) { }
}

export interface Queue extends Azure.ServiceBus.Results.Models.Queue {
    QueueTreeItem: QueueTreeItem;
}

export interface Topic extends Azure.ServiceBus.Results.Models.Topic {
    TopicTreeItem: TopicTreeItem;
}

export interface Subscription extends Azure.ServiceBus.Results.Models.Subscription { 
    SubscriptionTreeItem: SubscriptionTreeItem;
}

export interface Rule extends Azure.ServiceBus.Results.Models.Rule {
    RuleTreeItem: RuleTreeItem;
}

export enum ServiceBusType {
    Queue = 'Queue',
    Topic = 'Topic',
    Subscription = 'Subscription',
    Rule = 'Rule'
}

export type ServiceBusEntity = Queue | Topic | Subscription | Rule;