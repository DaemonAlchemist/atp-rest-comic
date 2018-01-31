
import arc from './routes/arc';
import arcHierarchy from './routes/arc-hierarchy';
import page from "./routes/page";
import commentary from "./routes/commentary";
import character from "./routes/character";
import attribute from "./routes/attribute";

export default ({
    routes: {arc, ['arc-hierarchy']: arcHierarchy, attribute, page, commentary, character},
    config: {
        //validators
    }
});
