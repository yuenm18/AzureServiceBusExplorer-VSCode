import { CreateQuickPickItems, validPTnHnMnSRegex } from '../service-bus/service-bus-utilities';

/**
 * Queue Utilities
 */
export class QueueUtilities {
    /**
     * Create options for a queue 
     */
    static getDefaultQueueCreateOptions(): CreateQuickPickItems[] {
        return [
            {
                label: 'Max Size in Megabytes',
                propertyDescription: 'Specifies the maximum queue size in megabytes. Any attempt to enqueue a message that will cause the queue to exceed this value will fail.',
                detail: undefined,
                property: 'MaxSizeInMegabytes',
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
                propertyDescription: 'Depending on whether DeadLettering is enabled, a message is automatically moved to the DeadLetterQueue or deleted if it has been stored in the queue for longer than the specified time. This value is overwritten by a TTL specified on the message if and only if the message TTL is smaller than the TTL set on the queue. This value is immutable after the Queue has been created.',
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
                label: 'Lock Duration',
                detail: undefined,
                property: 'LockDuration',
                propertyDescription: 'Determines the amount of time in seconds in which a message should be locked for processing by a receiver. After this period, the message is unlocked and available for consumption by the next receiver. Settable only at queue creation time.',
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
                propertyDescription: 'Settable only at queue creation time. If set to true, the queue will be session-aware and only SessionReceiver will be supported. Session-aware queues are not supported through REST.',
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
                label: 'Requires Duplicate Detection',
                detail: undefined,
                property: 'RequiresDuplicateDetection',
                propertyDescription: 'Settable only at queue creation time.',
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
                label: 'Dead Lettering On Message Expiration',
                detail: undefined,
                property: 'DeadLetteringOnMessageExpiration',
                propertyDescription: 'This field controls how the Service Bus handles a message whose TTL has expired. If it is enabled and a message expires, the Service Bus moves the message from the queue into the queue’s dead-letter sub-queue. If disabled, message will be permanently deleted from the queue. Settable only at queue creation time.',
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
                propertyDescription: 'Specifies the time span during which the Service Bus detects message duplication.',
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
                label: 'Enable Partitioning',
                detail: undefined,
                property: 'EnablePartitioning',
                propertyDescription: 'Specifies whether the queue should be partitioned.',
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
}