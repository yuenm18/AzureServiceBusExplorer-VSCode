import * as path from 'path';
import * as vscode from 'vscode';
import { ServiceBusType, ServiceBusEntity } from './service-bus-models';
import { URL } from 'url';


export const validPTnHnMnSRegex = /^(PT([\d]+H)?([1-5]?[0-9]M)?([1-5]?[0-9]S)?)?$/;

export interface CreateQuickPickItems extends vscode.QuickPickItem {
    property: string;
    propertyDescription: string;
    validate: any;
    getValue: any;
}

/**
 * Service Bus Utilities
 */
export class ServiceBusUtilities {
    /**
     * Shows a create name input dialog
     * @param existingNames Names that already exist (used for duplicate detection)
     * @param type The service bus type
     */
    static showCreateNameInput(existingNames: string[], type: ServiceBusType): Promise<string> {
        return new Promise(async (resolve, reject) => {
            let name = await vscode.window.showInputBox({
                placeHolder: `${type} Name`,
                prompt: `Enter the new ${type.toLowerCase()}\'s name`,
                validateInput: (name) => {
                    if (!/^[\w.-]+$/.test(name)) {
                        return `${type} name contains character(s) that is not allowed by Service Bus. Entity segments can contain only letters, numbers, periods (.), hyphens (-), and underscores (_)`;
                    }
    
                    if (existingNames.some(n => n.toLowerCase() === name.toLowerCase())) {
                        return `${type} already exists`;
                    }
                }
            });
    
            if (name) {
                resolve(name);
            } else {
                reject(`Invalid ${type} Name '${name}'.`);
            }
        });
    }
    
    /**
     * Shows the options selector for service bus entity creation
     * Displays a quick pick showing all create options and the user
     * @param createOptions Create options
     * @param name Name of the queue
     * @param type The service bus type
     */
    static showCreateOptionsSelector<CreateOptions>(createOptions: CreateQuickPickItems[], name: string, type: ServiceBusType): Promise<CreateOptions> {
        return new Promise((resolve, reject) => {
            // whether or not hiding the quick pick is due to opening the  
            let openingChangeSelectionInput = false;

            // the quick pick options selector
            let optionsPicker = vscode.window.createQuickPick<CreateQuickPickItems>();
            optionsPicker.items = createOptions;
            optionsPicker.placeholder = `Set options for '${name}' and then click create ${type.toLowerCase()} ⤴`;
    
            optionsPicker.buttons = [{
                iconPath: {
                    light: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'light', 'create.svg'),
                    dark: path.join(__filename, '..', '..', '..', 'resources', 'icons', 'dark', 'create.svg')
                },
    
                tooltip: `Create ${type}`
            }];
    
            optionsPicker.onDidChangeSelection(async items => {
                openingChangeSelectionInput = true;
                let item = items[0];

                // show input box used for setting the options value
                let newValue = await vscode.window.showInputBox({
                    placeHolder: item.label,
                    value: item.detail,
                    prompt: item.propertyDescription,
                    validateInput: item.validate,
                    ignoreFocusOut: true
                });
    
                item.detail = newValue;

                // show the options selector main menu
                try {
                    resolve(await ServiceBusUtilities.showCreateOptionsSelector(createOptions, name, type));
                } catch (e) {
                    reject(e);
                }
    
            });
    
            optionsPicker.onDidTriggerButton(() => {
                // build options object from values that were filled in
                let options: CreateOptions = createOptions.reduce((a, b) => {
                    if (b.detail !== undefined && b.detail !== '') {
                        (<any>a)[b.property] = b.getValue();
                    }
    
                    return a;
                }, <CreateOptions>{});
    
                optionsPicker.hide();
                resolve(options);
            });
    
            optionsPicker.onDidHide(() => {
                // reject if the user closes the quick pick (ignore if option picker closes because the input box is displayed) 
                if (!openingChangeSelectionInput) {
                    reject(`Operation cancelled during ${type.toLowerCase()} option selection.`);
                }
            });
    
            optionsPicker.show();
        });
    }
    
    /**
     * Shows a delete confirm dialog
     * @param name The name of the entity
     * @param type The service bus type
     */
    static showConfirmDelete(name: string, type: ServiceBusType): Promise<string> {
        return new Promise(async (resolve, reject) => {
            let result = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: `Are you sure you want to delete '${name}'?`,
            });
    
            if (result === 'Yes') {
                resolve(result);
            } else {
                reject(`Delete confirmation for ${type} '${result}' is not 'Yes'.`);
            }
        });
    }

    /**
     * Gets the entity id of the service bus entity
     * @param entity The entity
     */
    static getEntityId(entity: ServiceBusEntity | undefined): string | undefined {
        if (entity) {
            let entityUrl = new URL(entity._.id);
            return entityUrl.pathname;
        }
    }
}