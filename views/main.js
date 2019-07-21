(function () {
    let vscode = acquireVsCodeApi();
    let state;

    const serviceBusPrefix = 'service-bus-';
    const headerSection = document.querySelector('header[class=header-section]');
    const detailsSection = document.querySelector('aside[class=details-section]');
    const viewMessagesSection = document.querySelector('section[class=view-messages-section]');
    const sendMessagesSection = document.querySelector('section[class=send-messages-section]');

    window.addEventListener('message', event => {
        const message = event.data;
        ServiceBusManager.processMessage(message);
    })

///////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Service bus manager
     * Handles message received from extension
     */
    class ServiceBusManager {
        static processMessage(message) {
            state = message.state;
            switch (message.command) {
                case 'refresh':
                    ServiceBusManager.refreshState(state);
                    break;
                default:
                    break;
            }
        }

        static refreshState(state) {
            ServiceBusManager.clearContent();

            switch (state.type) {
                case 'Queue': {
                    ServiceBusManager.displayQueue(state)
                    break;
                }
                case 'Topic': {
                    ServiceBusManager.displayTopic(state)
                    break;
                }
                case 'Subscription': {
                    ServiceBusManager.displaySubscription(state)
                    break;
                }
                case 'Rule': {
                    ServiceBusManager.displayRule(state)
                    break;
                }
            }

            UIUtility.restoreUIState(state.uiState);
        }

        static displayQueue(state) {
            let title = document.createElement('h1');
            title.textContent = `Queue '${state.entity.QueueName}'`;

            let serviceBusDetails = document.createElement('service-bus-details');
            serviceBusDetails.fields = [
                ['Authorization Rules', 'AuthorizationRules'],
                ['Auto Delete On Idle', 'AutoDeleteOnIdle'],
                ['Dead Lettering On Message Expiration', 'DeadLetteringOnMessageExpiration'],
                ['Default Message Time To Live', 'DefaultMessageTimeToLive'],
                ['Duplicate Detection History Time Window', 'DuplicateDetectionHistoryTimeWindow'],
                ['Enable Batched Operations', 'EnableBatchedOperations'],
                ['Enable Express', 'EnableExpress'],
                ['Enable Partitioning', 'EnablePartitioning'],
                ['Entity Availability Status', 'EntityAvailabilityStatus'],
                ['Is Anonymous Accessible', 'IsAnonymousAccessible'],
                ['Lock Duration', 'LockDuration'],
                ['Max Delivery Count', 'MaxDeliveryCount'],
                ['Max Size In Megabytes', 'MaxSizeInMegabytes'],
                ['Message Count', 'MessageCount'],
                ['Requires Duplicate Detection', 'RequiresDuplicateDetection'],
                ['Requires Session', 'RequiresSession'],
                ['Size In Bytes', 'SizeInBytes'],
                ['Status', 'Status'],
                ['Support Ordering', 'SupportOrdering']
            ];
            serviceBusDetails.entity = state.entity;

            let serviceBusMessageTable = document.createElement('service-bus-message-table');
            serviceBusMessageTable.messages = state.messages;
            serviceBusMessageTable.messagesLastUpdated = state.messagesLastUpdated;
            serviceBusMessageTable.deadLetterMessages = state.deadLetterMessages;
            serviceBusMessageTable.deadLetterMessagesLastUpdated = state.deadLetterMessagesLastUpdated;

            let sendMessage = document.createElement('service-bus-send-message');

            let json = document.getElementsByTagName('pre')[0];
            json.textContent = JSON.stringify(state.entity, null, 4);

            headerSection.appendChild(title);
            detailsSection.appendChild(serviceBusDetails);
            viewMessagesSection.appendChild(serviceBusMessageTable);
            sendMessagesSection.appendChild(sendMessage);
        }

        static displayTopic(state) {
            let title = document.createElement('h1');
            title.textContent = `Topic '${state.entity.TopicName}'`;

            let serviceBusDetails = document.createElement('service-bus-details');
            serviceBusDetails.fields = [
                ['Authorization Rules', 'AuthorizationRules'],
                ['Auto Delete On Idle', 'AutoDeleteOnIdle'],
                ['Default Message Time To Live', 'DefaultMessageTimeToLive'],
                ['Duplicate Detection History Time Window', 'DuplicateDetectionHistoryTimeWindow'],
                ['Enable Batched Operations', 'EnableBatchedOperations'],
                ['Enable Express', 'EnableExpress'],
                ['Enable Partitioning', 'EnablePartitioning'],
                ['Enable Subscription Partitioning', 'EnableSubscriptionPartitioning'],
                ['Entity Availability Status', 'EntityAvailabilityStatus'],
                ['Filtering Messages Before Publishing', 'FilteringMessagesBeforePublishing'],
                ['Is Anonymous Accessible', 'IsAnonymousAccessible'],
                ['Is Express', 'IsExpress'],
                ['Max Size In Megabytes', 'MaxSizeInMegabytes'],
                ['Requires Duplicate Detection', 'RequiresDuplicateDetection'],
                ['Size In Bytes', 'SizeInBytes'],
                ['Status', 'Status'],
                ['Support Ordering', 'SupportOrdering']
            ];
            serviceBusDetails.entity = state.entity;

            let sendMessage = document.createElement('service-bus-send-message');

            let json = document.getElementsByTagName('pre')[0];
            json.textContent = JSON.stringify(state.entity, null, 4);

            headerSection.appendChild(title);
            detailsSection.appendChild(serviceBusDetails);
            sendMessagesSection.appendChild(sendMessage);
        }

        static displaySubscription(state) {
            let title = document.createElement('h1');
            title.textContent = `Subscription '${state.entity.SubscriptionName}'`;

            let serviceBusDetails = document.createElement('service-bus-details');
            serviceBusDetails.fields = [
                ['Auto Delete On Idle', 'AutoDeleteOnIdle'],
                ['Dead Lettering On Filter Evaluation Exceptions', 'DeadLetteringOnFilterEvaluationExceptions'],
                ['Dead Lettering On Message Expiration', 'DeadLetteringOnMessageExpiration'],
                ['Default Message Time To Live', 'DefaultMessageTimeToLive'],
                ['Enable Batched Operations', 'EnableBatchedOperations'],
                ['Entity Availability Status', 'EntityAvailabilityStatus'],
                ['Lock Duration', 'LockDuration'],
                ['Max Delivery Count', 'MaxDeliveryCount'],
                ['Message Count', 'MessageCount'],
                ['Requires Session', 'RequiresSession'],
                ['Status', 'Status']
            ];
            serviceBusDetails.entity = state.entity;

            let serviceBusMessageTable = document.createElement('service-bus-message-table');
            serviceBusMessageTable.messages = state.messages;
            serviceBusMessageTable.messagesLastUpdated = state.messagesLastUpdated;
            serviceBusMessageTable.deadLetterMessages = state.deadLetterMessages;
            serviceBusMessageTable.deadLetterMessagesLastUpdated = state.deadLetterMessagesLastUpdated;

            let json = document.getElementsByTagName('pre')[0];
            json.textContent = JSON.stringify(state.entity, null, 4);

            headerSection.appendChild(title);
            detailsSection.appendChild(serviceBusDetails);
            viewMessagesSection.appendChild(serviceBusMessageTable);
        }

        static displayRule(state) {
            let title = document.createElement('h1');
            title.textContent = `Rule '${state.entity.RuleName}'`;

            let sqlFilter = document.createElement('pre');
            sqlFilter.textContent = state.entity.Filter.SqlExpression;
            sqlFilter.classList.add('rule-filter');

            headerSection.appendChild(title);
            detailsSection.appendChild(sqlFilter);
        }

        static clearContent() {
            [headerSection, detailsSection, viewMessagesSection, sendMessagesSection].forEach(element => {
                while (element.firstChild) {
                    element.removeChild(element.firstChild);
                }
            });
        }

    }

///////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * UI Utilities
     */
    class UIUtility {
        static attachUIListener() {
            let uiElements = document.querySelectorAll(`[id^=${serviceBusPrefix}]`);
            uiElements.forEach(e => e.oninput = e.onclick = (e) => {
                vscode.postMessage({
                    command: 'set-ui',
                    state: state,
                    data: UIUtility.getUIState()
                });
            });
        }

        static getUIState() {
            // all ui elements we want to save begins with 'service-bus-'
            let uiElements = document.querySelectorAll(`[id^=${serviceBusPrefix}]`);
            let uiState = {};
            for (let uiElement of uiElements) {
                uiState[uiElement.id] = uiElement.value;
            }

            return uiState;
        }

        static restoreUIState(uiState) {
            // `${serviceBusPrefix}message-property-key-0` is always added so add one less
            Object.keys(state.uiState).filter(k => k.startsWith(`${serviceBusPrefix}message-property-key`) && k !== `${serviceBusPrefix}message-property-key-0`).forEach(() => document.querySelector('service-bus-send-message').addNewProperty());

            // all ui elements we want to save begins with 'service-bus-'
            let uiElements = document.querySelectorAll(`[id^=${serviceBusPrefix}]`);
            for (let uiElement of uiElements) {
                if (uiState[uiElement.id] !== undefined) {
                    uiElement.value = uiState[uiElement.id];
                    uiElement.setAttribute('value', uiState[uiElement.id]);
                }
            }
        }
    }

///////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Service bus send message component
     */
    class ServiceBusSendMessage extends HTMLElement {
        connectedCallback() {
            this.messagePropertyNumber = 0;
            this.render();
        }

        attributeChangedCallback(name, oldValue, newValue) {
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }

            this.render();
        }

        render() {
            let title = document.createElement('h3');
            title.textContent = 'Send Message';
            let messageBox = document.createElement('article');
            let messagesSection = document.createElement('section');
            let messageBodyLabel = document.createElement('label');
            let userPropertiesSection = document.createElement('section');
            let messagePropertiesLabel = document.createElement('label');
            let sendMessageButton = document.createElement('button');

            this.messageBodyInput = document.createElement('textarea');
            this.userPropertiesInput = document.createElement('div');

            messageBodyLabel.textContent = 'Message Body';
            this.messageBodyInput.placeholder = 'Message Body';
            this.messageBodyInput.id = `${serviceBusPrefix}message-body-input`;
            this.messageBodyInput.onkeydown = function (e) {
                if (e.key === 'Tab') {
                    e.preventDefault();
                    let originalSelectionStart = this.selectionStart;
                    this.value = this.value.substring(0, this.selectionStart) + '\t' + this.value.substring(this.selectionEnd);
                    this.selectionEnd = originalSelectionStart + 1;
                }
            };
            messagePropertiesLabel.textContent = 'Message Properties';
            sendMessageButton.textContent = 'Send Message';
            sendMessageButton.onclick = () => {
                let properties = {};
                for (let i = 0; i < this.userPropertiesInput.childElementCount / 2; i++) {
                    if (this.userPropertiesInput.childNodes[2 * i].value) {
                        properties[this.userPropertiesInput.childNodes[2 * i].value] = this.userPropertiesInput.childNodes[2 * i + 1].value;
                    }
                }

                vscode.postMessage({
                    command: 'send-message',
                    state: state,
                    data: {
                        body: this.messageBodyInput.value,
                        userProperties: properties
                    }
                });
            }

            messagesSection.append(messageBodyLabel, this.messageBodyInput);
            userPropertiesSection.append(messagePropertiesLabel, this.userPropertiesInput);
            messageBox.append(messagesSection, userPropertiesSection);
            this.append(title, messageBox, sendMessageButton);

            this.addNewProperty();
        }

        addNewProperty() {
            let propertyKey = document.createElement('input');
            propertyKey.placeholder = 'Key';
            propertyKey.id = `${serviceBusPrefix}message-property-key-${this.messagePropertyNumber}`;
            propertyKey.onblur = () => {
                if ([].every.call(document.querySelectorAll(`input[id^=${serviceBusPrefix}message-property-key-]`), e => e.value)) {
                    this.addNewProperty();
                }
            };
            let propertyValue = document.createElement('input');
            propertyValue.placeholder = 'Value';
            propertyValue.id = `${serviceBusPrefix}message-property-value-${this.messagePropertyNumber}`;


            this.userPropertiesInput.append(propertyKey, propertyValue);
            this.messagePropertyNumber++;
        }
    }

///////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Service bus message table component
     */
    class ServiceBusMessageTable extends HTMLElement {
        connectedCallback() {
            this.headers = [
                ['Message Id', 'messageId'],
                ['Message', 'body'],
                ['Created Date', 'enqueuedTimeUtc'],
                ['Expires Date', 'expiresAtUtc'],
            ];

            this.messageTabs = {
                'Messages': 'peek-messages',
                'Dead Letter Queue': 'peek-messages-dead-letter'
            };

            this.render();
        }

        attributeChangedCallback(name, oldValue, newValue) {
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }

            this.render();
        }

        render() {
            let title = document.createElement('h3');
            title.textContent = 'View Messages';

            // input selector
            let topBarSection = document.createElement('section');
            topBarSection.classList.add('top-bar-section');
            let countSelector = document.createElement('input');
            countSelector.placeholder = '# of Messages';
            countSelector.type = 'number';
            countSelector.min = 1;
            countSelector.max = 2147483647;
            countSelector.value === undefined && (countSelector.value = 10);
            countSelector.id = `${serviceBusPrefix}peek-message-selector`;
            countSelector.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    peekButton.onclick();
                }
            }

            countSelector.onkeyup = (e) => {
                if (countSelector.value === '') {
                    countSelector.value = '';
                    return;
                }

                if (!(countSelector.valueAsNumber <= countSelector.max)) {
                    countSelector.value = countSelector.max;
                }

                if (!(countSelector.valueAsNumber >= countSelector.min)) {
                    countSelector.value = countSelector.min;
                }
            }

            let peekButton = document.createElement('button');
            peekButton.textContent = 'Peek';
            peekButton.onclick = () => {
                let activeElement = messageQueueSelector.querySelector('[value="active"]');

                vscode.postMessage({
                    command: this.messageTabs[activeElement.textContent],
                    state: state,
                    data: +countSelector.value || undefined
                });

                let spinner = document.createElement('div')
                spinner.classList.add('spinner');
                tbody.appendChild(spinner);
            };

            let lastUpdatedField = document.createElement('span');
            lastUpdatedField.classList.add('last-accessed');

            topBarSection.append(countSelector, peekButton, lastUpdatedField);

            // the actual table
            let table = document.createElement('table');
            let thead = document.createElement('thead');
            let tbody = document.createElement('tbody');
            let headerRow = document.createElement('tr');

            table.classList.add('message-table');

            // set up headers
            for (let header of this.headers) {
                let th = document.createElement('th');
                th.textContent = header[0];
                headerRow.appendChild(th);
            }

            thead.appendChild(headerRow);

            // fill in data
            let tableBody = document.createElement('table');


            tbody.appendChild(tableBody);
            table.append(thead, tbody);

            let messageQueueSelector = document.createElement('section');
            let messageQueue = document.createElement('div');
            messageQueue.id = `${serviceBusPrefix}message-queue-tab`;
            let messageDeadLetterQueue = document.createElement('div');
            messageDeadLetterQueue.id = `${serviceBusPrefix}message-dead-letter-queue-tab`;
            messageQueueSelector.classList.add('message-queue-selector');
            messageQueueSelector.append(messageQueue, messageDeadLetterQueue);
            messageQueueSelector.addEventListener('click', (e) => {
                let target = e.target;
                [].forEach.call(messageQueueSelector.childNodes, n => {
                    n.value = '';
                    n.removeAttribute('value');
                });
                target.value = 'active';
                target.setAttribute('value', 'active');
                this.populateTable(tableBody, target.textContent, lastUpdatedField);
            }, true);
            messageQueue.textContent = Object.keys(this.messageTabs)[0];
            messageDeadLetterQueue.textContent = Object.keys(this.messageTabs)[1];

            // set the first messages tabs as default if there is none set after ui restore
            setTimeout(() => {
                if (![].some.call(messageQueueSelector.childNodes, n => n.value)) {
                    messageQueue.value = 'active';
                    messageQueue.setAttribute('value', 'active');
                }

                let activeTab = messageQueueSelector.querySelector('[value="active"]');
                this.populateTable(tableBody, activeTab.textContent, lastUpdatedField);
            });

            this.append(title, topBarSection, table, messageQueueSelector);
        }

        showMessage(message) {
            let messageDialogContainer = document.createElement('div');
            messageDialogContainer.classList.add('message-dialog-container');
            messageDialogContainer.onclick = (e) => {
                if (e.target === messageDialogContainer) {
                    this.removeChild(messageDialogContainer);
                }
            }
            let messageDialog = document.createElement('article');
            messageDialog.classList.add('message-dialog');
            messageDialogContainer.appendChild(messageDialog);


            let messageDetailsSection = document.createElement('table');
            let messageDetailProperties = [
                ['Message Id', 'messageId'],
                ['Created Date', 'enqueuedTimeUtc'],
                ['Expires Date', 'expiresAtUtc'],
            ];
            for (let property of messageDetailProperties) {
                let detailRow = document.createElement('tr');
                let label = document.createElement('th');
                label.textContent = property[0];
                let value = document.createElement('td');
                value.textContent = message[property[1]];
                detailRow.append(label, value);
                messageDetailsSection.append(detailRow);
            }

            let messageMainSection = document.createElement('section');
            let messageBodySection = document.createElement('section');
            let messageBodyLabel = document.createElement('h5');
            messageBodyLabel.textContent = 'Message Body';
            messageMainSection.classList.add('message-main');
            let messageBody = document.createElement('pre');
            messageBody.textContent = message.body;
            messageBodySection.append(messageBodyLabel, messageBody);


            let messagePropertiesSection = document.createElement('section');
            let messagePropertyLabel = document.createElement('h5');
            messagePropertyLabel.textContent = 'Message Properties';
            let messageProperties = document.createElement('div');
            messageProperties.classList.add('message-details');
            let propertiesTable = document.createElement('table');
            for (let propertyKey of Object.keys(message.userProperties)) {
                let propertyRow = document.createElement('tr');
                let key = document.createElement('th');
                key.textContent = propertyKey;
                let value = document.createElement('td');
                value.textContent = message.userProperties[propertyKey];
                propertyRow.append(key, value);
                propertiesTable.append(propertyRow);
            }
            messageProperties.appendChild(propertiesTable);
            messagePropertiesSection.append(messagePropertyLabel, messageProperties);
            messageMainSection.append(messageBodySection, messagePropertiesSection)
            messageDialog.append(messageDetailsSection, messageMainSection);
            this.appendChild(messageDialogContainer);
        }

        populateTable(tableBody, tabName, lastUpdatedField) {
            // get input properties
            let messages;
            let lastUpdated;
            switch (tabName) {
                case Object.keys(this.messageTabs)[0]: {
                    messages = this.messages || [];
                    lastUpdated = this.messagesLastUpdated || 'Never';
                    break;
                }
                case Object.keys(this.messageTabs)[1]: {
                    messages = this.deadLetterMessages || [];
                    lastUpdated = this.deadLetterMessagesLastUpdated || 'Never';
                    break;
                }
            }

            // clear table
            while (tableBody.firstChild) {
                tableBody.removeChild(tableBody.firstChild);
            }

            // populate table
            if (messages.length) {
                for (let message of messages) {
                    let tr = document.createElement('tr');
                    tr.onclick = () => {
                        this.showMessage(message);
                    };
                    for (let header of this.headers) {
                        let td = document.createElement('td');
                        let messageContent = document.createElement('p');
                        messageContent.classList.add('message-content');
                        messageContent.textContent = message[header[1]];
                        td.appendChild(messageContent);
                        tr.appendChild(td);
                    }

                    tableBody.append(tr);
                }
            } else {
                let noMessages = document.createElement('em');
                noMessages.textContent = 'No Messages';
                tableBody.appendChild(noMessages);
            }

            // last updated time
            lastUpdatedField.textContent = `Last Updated: ${new Date(lastUpdated).toLocaleString()}`;
        }
    }

///////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * Service bus details component
     */
    class ServiceBusDetails extends HTMLElement {
        connectedCallback() {
            this.render();
        }

        attributeChangedCallback(name, oldValue, newValue) {
            while (this.firstChild) {
                this.removeChild(this.firstChild);
            }

            this.render();
        }

        render() {
            let entity = this.entity || {};
            let fields = this.fields || [];

            let table = document.createElement('table');
            table.classList.add('details-table');

            for (let field of fields) {
                let tr = document.createElement('tr');
                let th = document.createElement('th');
                let td = document.createElement('td');

                th.classList.add('details-header');

                th.textContent = field[0];
                td.textContent = entity[field[1]];

                tr.append(th, td);
                table.append(tr);
            }

            this.appendChild(table);
        }
    }

    customElements.define('service-bus-send-message', ServiceBusSendMessage);
    customElements.define('service-bus-message-table', ServiceBusMessageTable);
    customElements.define('service-bus-details', ServiceBusDetails);

    setInterval(() => UIUtility.attachUIListener(), 1000);
})()