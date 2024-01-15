import { open } from './page-manager.js';
import { fromURL, start } from './pages.js';

if ((window.location.search?.length ?? 0) > 1) {
	open(fromURL);
} else {
	open(start);
}
