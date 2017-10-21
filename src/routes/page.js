/**
 * Created by Andy on 8/25/2017.
 */

import {basicController} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import Page from "../model/page";

const permissions = createCrudPermissions('comic', 'page');
const model = Page;
const idField = 'pageId';

export default basicController.entity.crud({model, permissions, idField});
