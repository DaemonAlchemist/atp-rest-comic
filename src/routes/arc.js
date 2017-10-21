/**
 * Created by Andy on 8/25/2017.
 */

import {basicController} from 'atp-rest';
import {createCrudPermissions} from "atp-rest-uac";
import Arc from "../model/arc";

const permissions = createCrudPermissions('comic', 'arc');
const model = Arc;
const idField = 'arcId';

export default basicController.entity.crud({model, permissions, idField});
