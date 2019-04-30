import { CreateQuickPickItems, validPTnHnMnSRegex } from '../service-bus/service-bus-utilities';

/**
 * Topic utilities
 */
export class TopicUtilities {
    /**
     * Create options for a topic
     */
    static getDefaultTopicCreateOptions(): CreateQuickPickItems[] {
        return [
            {
                label: 'Max Size in Megabytes',
                propertyDescription: 'Specifies the maximum topic size in megabytes. Any attempt to enqueue a message that will cause the topic to exceed this value will fail. All messages that are stored in the topic or any of its subscriptions count towards this value. Multiple copies of a message that reside in one or multiple subscriptions count as a single messages. For example, if message m exists once in subscription s1 and twice in subscription s2, m is counted as a single message.',
                detail: undefined,
                property: 'MaxSizeInMegaBytes',
                validate: (value: string) => {
                    if (!(+value >= 0)) {
                        return 'Value must be a whole number';
                    }
                },
                getValue() {
                    return isNaN(+<any>this.detail) ? undefined : +<any>this.detail;
                }
            },
            {
                label: 'Default Message Time To Live',
                detail: undefined,
                property: 'DefaultMessageTimeToLive',
                propertyDescription: 'Determines how long a message lives in the associated subscriptions. Subscriptions inherit the TTL from the topic unless they are created explicitly with a smaller TTL. Based on whether dead-lettering is enabled, a message whose TTL has expired will either be moved to the subscription’s associated DeadLtterQueue or will be permanently deleted.',
                validate: (value: string) => {
                    if (!validPTnHnMnSRegex.test(value)) {
                        return 'Value must be in PTnHnMnS format';
                    }
                },
                getValue() {
                    return this.detail || undefined;
                }
            },
            {
                label: 'Requires Duplicate Detection',
                detail: undefined,
                property: 'RequiresDuplicateDetection',
                propertyDescription: 'If enabled, the topic will detect duplicate messages within the time span specified by the DuplicateDetectionHistoryTimeWindow property. Settable only at topic creation time.',
                validate: (value: string) => {
                    if (value && value !== 'true' && value !== 'false') {
                        return 'Value needs to be either true or false';
                    }
                },
                getValue() {
                    return this.detail ? this.detail === 'true' : undefined;
                }
            },
            {
                label: 'Duplicate Detection History Time Window',
                detail: undefined,
                property: 'DuplicateDetectionHistoryTimeWindow',
                propertyDescription: 'Specifies the time span during which the Service Bus will detect message duplication.',
                validate: (value: string) => {
                    if (!validPTnHnMnSRegex.test(value)) {
                        return 'Value must be in PTnHnMnS format';
                    }
                },
                getValue() {
                    return this.detail || undefined;
                }
            },
            {
                label: 'Enable Batched Operations',
                detail: undefined,
                property: 'EnableBatchedOperations',
                propertyDescription: 'Specifies if batched operations should be allowed.',
                validate: (value: string) => {
                    if (value && value !== 'true' && value !== 'false') {
                        return 'Value needs to be either true or false';
                    }
                },
                getValue() {
                    return this.detail ? this.detail === 'true' : undefined;
                }
            },
            {
                label: 'Size In Bytes',
                detail: undefined,
                property: 'SizeInBytes',
                propertyDescription: 'Specifies the topic size in bytes.',
                validate: (value: string) => {
                    if (!(+value >= 0)) {
                        return 'Value must be a whole number';
                    }
                },
                getValue() {
                    return isNaN(+<any>this.detail) ? undefined : +<any>this.detail;
                }
            },
            {
                label: 'Support Ordering',
                detail: undefined,
                property: 'SupportOrdering',
                propertyDescription: 'Specifies whether the topic supports message ordering.',
                validate: (value: string) => {
                    if (value && value !== 'true' && value !== 'false') {
                        return 'Value needs to be either true or false';
                    }
                },
                getValue() {
                    return this.detail ? this.detail === 'true' : undefined;
                }
            },
            {
                label: 'Enable Partitioning',
                detail: undefined,
                property: 'EnablePartitioning',
                propertyDescription: 'Specifies whether the topic should be partitioned',
                validate: (value: string) => {
                    if (value && value !== 'true' && value !== 'false') {
                        return 'Value needs to be either true or false';
                    }
                },
                getValue() {
                    return this.detail ? this.detail === 'true' : undefined;
                }
            }
        ];
    }
    
    /**
     * Create options for a subscription
     */
    static getDefaultSubscriptionCreateOptions(): CreateQuickPickItems[] {
        return [
            {
                label: 'Lock Duration',
                detail: undefined,
                property: 'LockDuration',
                propertyDescription: 'The default lock duration is applied to subscriptions that do not define a lock duration. Settable only at subscription creation time.',
                validate: (value: string) => {
                    if (!validPTnHnMnSRegex.test(value)) {
                        return 'Value must be in PTnHnMnS format';
                    }
                },
                getValue() {
                    return this.detail || undefined;
                }
            },
            {
                label: 'Requires Session',
                detail: undefined,
                property: 'RequiresSession',
                propertyDescription: 'Settable only at subscription creation time. If set to true, the subscription will be session-aware and only SessionReceiver will be supported. Session-aware subscription are not supported through REST.',
                validate: (value: string) => {
                    if (value && value !== 'true' && value !== 'false') {
                        return 'Value needs to be either true or false';
                    }
                },
                getValue() {
                    return this.detail ? this.detail === 'true' : undefined;
                }
            },
            {
                label: 'Default Message Time To Live',
                detail: undefined,
                property: 'DefaultMessageTimeToLive',
                propertyDescription: 'Determines how long a message lives in the subscription. Based on whether dead-lettering is enabled, a message whose TTL has expired will either be moved to the subscription’s associated DeadLetterQueue or permanently deleted.',
                validate: (value: string) => {
                    if (!validPTnHnMnSRegex.test(value)) {
                        return 'Value must be in PTnHnMnS format';
                    }
                },
                getValue() {
                    return this.detail || undefined;
                }
            },
            {
                label: 'Enable Dead Lettering On Message Expiration',
                detail: undefined,
                property: 'EnableDeadLetteringOnMessageExpiration',
                propertyDescription: 'This field controls how the Service Bus handles a message whose TTL has expired. If it is enabled and a message expires, the Service Bus moves the message from the queue into the subscription’s dead-letter sub-queue. If disabled, message will be permanently deleted from the subscription’s main queue. Settable only at subscription creation time.',
                validate: (value: string) => {
                    if (value && value !== 'true' && value !== 'false') {
                        return 'Value needs to be either true or false';
                    }
                },
                getValue() {
                    return this.detail ? this.detail === 'true' : undefined;
                }
            },
            {
                label: 'Enable Dead Lettering On Filter Evaluation Exceptions',
                detail: undefined,
                property: 'EnableDeadLetteringOnFilterEvaluationExceptions',
                propertyDescription: 'Determines how the Service Bus handles a message that causes an exception during a subscription’s filter evaluation. If the value is set to true, the message that caused the exception will be moved to the subscription’s dead-letter queue. Otherwise, it will be discarded. By default this parameter is set to true, allowing the user a chance to investigate the cause of the exception. It can occur from a malformed message or some incorrect assumptions being made in the filter about the form of the message. Settable only at topic creation time.',
                validate: (value: string) => {
                    if (value && value !== 'true' && value !== 'false') {
                        return 'Value needs to be either true or false';
                    }
                },
                getValue() {
                    return this.detail ? this.detail === 'true' : undefined;
                }
            }
        ];
    }

    /**
     * Create options for a rule
     */
    static getDefaultRuleCreateOptions(): CreateQuickPickItems[] {
        return [
            {
                label: 'True Filter',
                detail: undefined,
                property: 'trueFilter',
                propertyDescription: 'Defines the expression that the rule evaluates as a true filter.',
                validate: (value: string) => {
                    return;
                },
                getValue() {
                    return this.detail || undefined;
                }
            },
            {
                label: 'False Filter',
                detail: undefined,
                property: 'falseFilter',
                propertyDescription: 'Defines the expression that the rule evaluates as a true filter.',
                validate: (value: string) => {
                    return;
                },
                getValue() {
                    return this.detail || undefined;
                }
            },
            {
                label: 'Sql Expression Filter',
                detail: undefined,
                property: 'sqlExpressionFilter',
                propertyDescription: 'Defines the expression that the rule evaluates. The expression string is interpreted as a SQL92 expression which must evaluate to True or False. Only one between a correlation and a sql expression can be defined.',
                validate: (value: string) => {
                    return;
                },
                getValue() {
                    return this.detail || undefined;
                }
            },
            {
                label: 'Correlation Id Filter',
                detail: undefined,
                property: 'correlationIdFilter',
                propertyDescription: 'Defines the expression that the rule evaluates. Only the messages whose CorrelationId match the CorrelationId set in the filter expression are allowed. Only one between a correlation and a sql expression can be defined.',
                validate: (value: string) => {
                    return;
                },
                getValue() {
                    return this.detail || undefined;
                }
            },
            {
                label: 'Sql Rule Action',
                detail: undefined,
                property: 'sqlRuleAction',
                propertyDescription: 'Defines the expression that the rule evaluates. If the rule is of type SQL, the expression string is interpreted as a SQL92 expression which must evaluate to True or False. If the rule is of type CorrelationFilterExpression then only the messages whose CorrelationId match the CorrelationId set in the filter expression are allowed.',
                validate: (value: string) => {
                    return;
                },
                getValue() {
                    return this.detail || undefined;
                }
            }
        ];
    }
}