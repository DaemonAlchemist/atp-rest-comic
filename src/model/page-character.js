/**
 * Created by Andrea on 8/27/2017.
 */

import {Entity} from 'atp-active-record';

export default class PageCharacter extends Entity
{
    constructor() {
        super('comic', 'atpcomic_page_character_view', []);
    }
}

export class PageCharacterBase extends Entity
{
    constructor(){
        super('comic', 'atpcomic_page_character', []);
    }
}