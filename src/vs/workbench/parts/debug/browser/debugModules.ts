/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import 'vs/css!./media/repl';
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

const $ = dom.emmet;

export class Modules extends Panel {
	private toDispose: lifecycle.IDisposable[];
	//private actions: actions.IAction[];

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
		
	}


	public create(parent: builder.Builder): TPromise<void> {
		super.create(parent);
		const container = dom.append(parent.getHTMLElement(), $('.modules'));

		var str = nls.localize('helloModules', "Hello Modules");
		var helloElement = document.createTextNode("Hello Modules");
		
		container.appendChild(helloElement);

		return TPromise.as(null);
	}
	

	public layout(dimension: builder.Dimension): void {
		
	}

	public focus(): void {
		
	}

	public reveal(element: debug.ITreeElement): TPromise<void> {
		return TPromise.as(null);
	}

	/*public getActions(): actions.IAction[] {
		if (!this.actions) {
			this.actions = [
				this.instantiationService.createInstance(debugactions.ClearReplAction, debugactions.ClearReplAction.ID, debugactions.ClearReplAction.LABEL)
			];

			this.actions.forEach(a => {
				this.toDispose.push(a);
			});
		}

		return this.actions;
	}*/

	public shutdown(): void {
		
	}

	public dispose(): void {
		// destroy container
		this.toDispose = lifecycle.dispose(this.toDispose);

		super.dispose();
	}
}
