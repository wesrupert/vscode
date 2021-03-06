/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import {Range} from 'vs/editor/common/core/range';
import {ISelection} from 'vs/editor/common/editorCommon';

/**
 * The direction of a selection.
 */
export enum SelectionDirection {
	/**
	 * The selection starts above where it ends.
	 */
	LTR,
	/**
	 * The selection starts below where it ends.
	 */
	RTL
}

/**
 * A selection in the editor.
 */
export class Selection extends Range {
	public selectionStartLineNumber: number;
	public selectionStartColumn: number;
	public positionLineNumber: number;
	public positionColumn: number;

	constructor(selectionStartLineNumber: number, selectionStartColumn: number, positionLineNumber: number, positionColumn: number) {
		super(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn);
		this.selectionStartLineNumber = selectionStartLineNumber;
		this.selectionStartColumn = selectionStartColumn;
		this.positionLineNumber = positionLineNumber;
		this.positionColumn = positionColumn;
	}

	/**
	 * Clone this selection.
	 */
	public clone(): Selection {
		return new Selection(this.selectionStartLineNumber, this.selectionStartColumn, this.positionLineNumber, this.positionColumn);
	}

	public toString(): string {
		return '[' + this.selectionStartLineNumber + ',' + this.selectionStartColumn + ' -> ' + this.positionLineNumber + ',' + this.positionColumn + ']';
	}

	/**
	 * Test if equals other selection.
	 */
	public equalsSelection(other: ISelection): boolean {
		return (
			Selection.selectionsEqual(this, other)
		);
	}

	/**
	 * Get directions (LTR or RTL).
	 */
	public getDirection(): SelectionDirection {
		if (this.selectionStartLineNumber === this.startLineNumber && this.selectionStartColumn === this.startColumn) {
			return SelectionDirection.LTR;
		}
		return SelectionDirection.RTL;
	}

	/**
	 * Create a new selection with a different `positionLineNumber` and `positionColumn`.
	 */
	public setEndPosition(endLineNumber: number, endColumn: number): Selection {
		if (this.getDirection() === SelectionDirection.LTR) {
			return new Selection(this.startLineNumber, this.startColumn, endLineNumber, endColumn);
		}
		return new Selection(endLineNumber, endColumn, this.startLineNumber, this.startColumn);
	}

	/**
	 * Create a new selection with a different `selectionStartLineNumber` and `selectionStartColumn`.
	 */
	public setStartPosition(startLineNumber: number, startColumn: number): Selection {
		if (this.getDirection() === SelectionDirection.LTR) {
			return new Selection(startLineNumber, startColumn, this.endLineNumber, this.endColumn);
		}
		return new Selection(this.endLineNumber, this.endColumn, startLineNumber, startColumn);
	}

	// ----

	public static createSelection(selectionStartLineNumber: number, selectionStartColumn: number, positionLineNumber: number, positionColumn: number): Selection {
		return new Selection(selectionStartLineNumber, selectionStartColumn, positionLineNumber, positionColumn);
	}

	public static liftSelection(sel:ISelection): Selection {
		return new Selection(sel.selectionStartLineNumber, sel.selectionStartColumn, sel.positionLineNumber, sel.positionColumn);
	}

	public static selectionsEqual(a:ISelection, b:ISelection): boolean {
		return (
			a.selectionStartLineNumber === b.selectionStartLineNumber &&
			a.selectionStartColumn === b.selectionStartColumn &&
			a.positionLineNumber === b.positionLineNumber &&
			a.positionColumn === b.positionColumn
		);
	}

	public static selectionsArrEqual(a:ISelection[], b:ISelection[]): boolean {
		if (a && !b || !a && b) {
			return false;
		}
		if (!a && !b) {
			return true;
		}
		if (a.length !== b.length) {
			return false;
		}
		for (var i = 0, len = a.length; i < len; i++) {
			if (!this.selectionsEqual(a[i], b[i])) {
				return false;
			}
		}
		return true;
	}

	public static isISelection(obj: any): boolean {
		return (
			obj
			&& (typeof obj.selectionStartLineNumber === 'number')
			&& (typeof obj.selectionStartColumn === 'number')
			&& (typeof obj.positionLineNumber === 'number')
			&& (typeof obj.positionColumn === 'number')
		);
	}

	public static createWithDirection(startLineNumber: number, startColumn: number, endLineNumber: number, endColumn: number, direction:SelectionDirection): Selection {

		if (direction === SelectionDirection.LTR) {
			return new Selection(startLineNumber, startColumn, endLineNumber, endColumn);
		}

		return new Selection(endLineNumber, endColumn, startLineNumber, startColumn);
	}
}