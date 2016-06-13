/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'vs/css!./media/debugModules';
import nls = require('vs/nls');
import { TPromise } from 'vs/base/common/winjs.base';
import lifecycle = require('vs/base/common/lifecycle');
import builder = require('vs/base/browser/builder');
import dom = require('vs/base/browser/dom');
import { IEventService } from 'vs/platform/event/common/event';
import debug = require('vs/workbench/parts/debug/common/debug');
import { Panel } from 'vs/workbench/browser/panel';
import { ITelemetryService } from 'vs/platform/telemetry/common/telemetry';
import { IContextViewService, IContextMenuService } from 'vs/platform/contextview/browser/contextView';
import { IInstantiationService } from 'vs/platform/instantiation/common/instantiation';
import { IWorkspaceContextService } from 'vs/workbench/services/workspace/common/contextService';
import { ScrollableElement } from 'vs/base/browser/ui/scrollbar/scrollableElement';
import { ScrollbarVisibility } from 'vs/base/browser/ui/scrollbar/scrollableElementOptions';
import { remote } from 'electron';

const dialog = remote.dialog;

const $ = dom.emmet;

export class Modules extends Panel {
	private toDispose: lifecycle.IDisposable[];
	private scrollableElement: ScrollableElement;
	
	private nameColumn: HTMLElement;
	private symbolStatusColumn: HTMLElement;
	private symbolPathColumn: HTMLElement;
	private versionColumn: HTMLElement;
	//private timeStampColumn: HTMLElement;
	private modulePathColumn: HTMLElement;
	
	private cellElements: { [reference: string]: HTMLElement[]; }; ;
	
	private modules: { [reference: string]: debug.IModule; };

	constructor(
		@debug.IDebugService private debugService: debug.IDebugService,
		@IContextMenuService private contextMenuService: IContextMenuService,
		@IWorkspaceContextService private contextService: IWorkspaceContextService,
		@ITelemetryService telemetryService: ITelemetryService,
		@IInstantiationService private instantiationService: IInstantiationService,
		@IContextViewService private contextViewService: IContextViewService,
		@IEventService private eventService: IEventService
	) {
		super(debug.MODULES_ID, telemetryService);

		this.toDispose = [];
		this.registerListeners();
	}

	private registerListeners(): void {
		this.toDispose.push(this.debugService.getModel().onModuleAdded((m: debug.IModule) => this.onModuleAdded(m)));
		this.toDispose.push(this.debugService.getModel().onModuleRemoved((m: debug.IModule) => this.onModuleRemoved(m)));
	}	
	
	public createColumn(container: HTMLElement, columnName: string) : HTMLElement {
		
		var colDiv = dom.append(container, $('.modulesColumn'));
		container.appendChild(colDiv);
		
		var columnNameStr = nls.localize('', columnName);
		var colHeaderText = document.createTextNode(columnNameStr);
		
		var colHeader = dom.append(colDiv, $('.modulesHeader'));
		colHeader.appendChild(colHeaderText);
		colDiv.appendChild(colHeader);
		
		return colDiv;
	}
	
	public appendElementToColumn(column: HTMLElement, value: string) {
		var bodyTextElement = document.createTextNode(value);
   		
		var bodyElement = dom.append(column, $('.modulesCell'));
		bodyElement.appendChild(bodyTextElement);
		column.appendChild(bodyElement);
	}

	public create(parent: builder.Builder): TPromise<void> {
		super.create(parent);		
		
		this.cellElements = {};
		const container = dom.append(parent.getHTMLElement(), $('.debugModules'));
		
		const innerContainer = dom.append(container, $('.debugModules'));
		
		this.scrollableElement = new ScrollableElement(innerContainer, {
			canUseTranslate3d: false,
			horizontal: ScrollbarVisibility.Auto,
			vertical: ScrollbarVisibility.Auto,
			useShadows: false,
			saveLastScrollTimeOnClassName: 'monaco-list-row'
		});
		container.appendChild(this.scrollableElement.getDomNode());
		
		this.toDispose.concat(this.scrollableElement);

		this.nameColumn = this.createColumn(container, nls.localize('moduleName', "Name"));
		this.symbolStatusColumn = this.createColumn(container, nls.localize('symbolStatus', "Symbol Status"));
		this.symbolPathColumn = this.createColumn(container, nls.localize('symbolPath', "Symbol Path"));
		this.versionColumn = this.createColumn(container, nls.localize('version', "Version"));
		//this.timeStampColumn = this.createColumn(container, nls.localize('timestamp', "Timestamp"));
		this.modulePathColumn = this.createColumn(container, nls.localize('modulePath', "Path"));	
		this.initializeModules();
	
		return TPromise.as(null);
	}
	
	private addTextNode(module: debug.IModule, parent: HTMLElement, value: string, clickHandler = null) {
		var nameTextNode = document.createTextNode(value);
		var element = dom.append(parent, $('.modulesCell'));
		element.appendChild(nameTextNode);
		
		if (clickHandler !== null) {
			element.addEventListener('click', clickHandler);
			element.className = 'modulesCellClickable';
		}
	
		if (this.cellElements[module.name] === undefined)
		{	
			this.cellElements[module.name] = [element];
		}
		else {
			this.cellElements[module.name].push(element);
		}		
	}

	
	private addModule(module: debug.IModule) {		
		this.addTextNode(module, this.nameColumn, module.name);
		
		var searchForSymbols : string = nls.localize('symbolsNotLoaded', "Symbols not loaded");
		
		if (module.symbolStatus === searchForSymbols) {
			this.addTextNode(module, this.symbolStatusColumn, module.symbolStatus, () => this.searchForSymbols(module));
		}
		else {
			this.addTextNode(module, this.symbolStatusColumn, module.symbolStatus);
		}
		this.addTextNode(module, this.symbolPathColumn, module.symbolPath);
		this.addTextNode(module, this.versionColumn, module.version);
		//TODO: this.addTextNode(module, this.timeStampColumn, module.timeStamp);
		this.addTextNode(module, this.modulePathColumn, module.path);
	}
	
	private searchForSymbols(module: debug.IModule) {
		var title: string = nls.localize('findSymbols', "Find Symbols");
		//var filters = [{name:'pdb', extensions:['.pdb']}, {name:'so', extensions:['.so']}, {name:'any', extensions:['*']}];
		let pickerProperties: string[];
		pickerProperties = ['openFile'];
		
		dialog.showOpenDialog({
			title: title,
			//filters: filters,
			properties: pickerProperties
		}, (paths) => {
			if (paths && paths.length > 0) {
				// TODO: send message to load symbol file
			}
		});
	}
	
	private initializeModules() : void {
		
		for (var moduleName in this.cellElements) {
			var elements: HTMLElement[];
			elements = this.cellElements[moduleName];
			
			for (var e in elements) {
				var element: HTMLElement;
				element = elements[e];
				element.parentNode.removeChild(element);
			}
		}
		this.cellElements = {};
		this.modules = this.debugService.getModel().getModules();
		
		for (var modName in this.modules) {
			this.addModule(this.modules[modName]);
		}			
	}
	
	private onModuleAdded(module: debug.IModule) : void { 
		this.cellElements[module.name] = [];
		this.modules[module.name] = module;
		this.addModule(module);
	}	
	
	private onModuleRemoved(module: debug.IModule) : void {
		var elements: HTMLElement[] = this.cellElements[module.name];
		for (var e in elements) {
			var element: HTMLElement;
			element = elements[e];
			element.parentNode.removeChild(element);
		}
	}	

	public layout(dimension: builder.Dimension): void {
		
	}

	public focus(): void {
		
	}

	public reveal(element: debug.ITreeElement): TPromise<void> {
		return TPromise.as(null);
	}
	public shutdown(): void {
		
	}

	public dispose(): void {
		// destroy container
		this.toDispose = lifecycle.dispose(this.toDispose);

		super.dispose();
	}
}
