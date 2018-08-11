import { startGame } from './engine';

import 'normalize-css/normalize.css';
import './styles';

document.body.innerHTML = `
<div class="wrapper">
    <div class="map-container">
        <pre class="map"></pre>
    </div>
</div>
`;
const mapContainer = document.querySelector('.map');

startGame(mapContainer);
