import {Router} from 'express';
import { searchPhongTro } from '../controllers/SearchController';
const routerSearch = Router();

routerSearch.get('/search',searchPhongTro )

export default routerSearch;