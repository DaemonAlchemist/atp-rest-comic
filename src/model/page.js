/**
 * Created by Andrea on 8/27/2017.
 */

import {Entity} from 'atp-active-record';
import config from 'atp-config';

export default class Page extends Entity
{
    constructor() {
        super('comic', 'atpcomic_pages');
    }
}
