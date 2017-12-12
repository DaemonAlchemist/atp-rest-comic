/**
 * Created by Andy on 8/25/2017.
 */

import arcRoutes from './routes/arc';
import pageRoutes from "./routes/page";
import commentaryRoutes from "./routes/commentary";

export default ({
    routes: {
        arc: arcRoutes,
        page: pageRoutes,
        commentary: commentaryRoutes
    },
    config: {
        //validators
    }
});
