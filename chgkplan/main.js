// https://github.com/vasturiano/timelines-chart
const INNER_WIDTH = window.innerWidth;
const NOW = Date.now();
const START_AFTER = new Date(NOW - 4 * 30 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10); // NOW-4months
const END_AFTER = new Date(NOW - 7 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10); // NOW-7days
const END_BEFORE = new Date(NOW + 4 * 30 * 24 * 60 * 60 * 1000)
    .toISOString().slice(0, 10); // NOW+4months
let GAME_COUNT = -1;
let TOURS = {};
let TOURS_EXTRA = {};
let PLAYER = [];
const SCALE_DOMAINS = ['+', '-', '0', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8+'];
const SCALE_COLORS_BLUE = [
    '#74747a',
    '#e6f2ff', '#cce6ff', '#b3d9ff', '#99ccff', '#80bfff', '#66b3ff',
    '#4da6ff', '#3399ff', '#1a8cff', '#0080ff',
    '#0073e6', '#0066cc', '#0059b3', '#004d99', '#004080', '#003366', '#00264d']
const SCALE_COLORS_3GROUPS = [
    '#c9c9c9', '#4b4b4b',
    '#c6ecc6', '#8cd98c', '#53c653', '#39ac39', '#2d862d', '#194d19',
    '#1a8cff', '#0073e6', '#0059b3', '#004d99',
    '#ffcccc', '#ff8080', '#ff4d4d', '#ff0000', '#b30000', '#660000', '#000000']
const SCALE_COLORS = SCALE_COLORS_3GROUPS;

function _groupBy(xs, f) {
    return xs.reduce((r, v, i, a, k = f(v)) => ((r[k] || (r[k] = [])).push(v), r), {});
}

function loadData() {
    const promises = [
        "https://quiza.stalnuhhin.ee/chgkplan/tours.php",
        "https://quiza.stalnuhhin.ee/chgkplan/tours-extra.php"
    ].map(url => fetch(url).then(r => r.json()));
    return Promise.all(promises);
}

function loadPlayerData() {
    return Promise.all([fetch("https://quiza.stalnuhhin.ee/chgkplan/player.php?playerid=30337")
        .then(r => r.json())])
        .then(r => {
            PLAYER = r[0];
        });
}

function prepareData() {
    const data = TOURS.tours;
    GAME_COUNT = data.length;
    const result = [];
    data.forEach(g => {
        let t = TOURS_EXTRA["id" + g.id];
        g.dl = t ? (t.dl ? t.dl : -1) : -1;
        g.start = Date.parse(g.dateStart);
        g.end = Date.parse(g.dateEnd);
    });
    const groups = {"": data.filter(i => i.type.id != 2)}
    // FIXME group by type = this._groupBy(data, (i) => i.type.id + " " + i.type.name);
    Object.entries(groups).map(g => {
        result.push(this.prepareGroup(g[0], g[1]));
    });
    return result;
}

function prepareGroup(groupName, games) {
    const labels = games.sort(smartSort).map(game => this.prepareLabel(game));
    return {"group": groupName, "data": labels}
}

function smartSort(a, b) {
    const aAfter = NOW > a.end;
    const bAfter = NOW > b.end;
    if (aAfter && !bAfter) {
        return -1;
    }
    if (!aAfter && bAfter) {
        return 1;
    }

    const aBefore = NOW < a.start;
    const bBefore = NOW < b.start;
    if (aBefore && bBefore) {
        return a.dateStart.localeCompare(b.dateStart);
    }

    const aIn = NOW > a.start && NOW < a.end;
    const bIn = NOW > b.start && NOW < b.end;
    if (aIn && !bIn) {
        return -1;
    }
    if (!aIn && bIn) {
        return 1;
    }
    return a.dateEnd.localeCompare(b.dateEnd);
}

function prepareLabel(game) {
    return {
        "label": game.name,
        "data": [{
            "game": game,
            "timeRange": [game.dateStart, game.dateEnd],
            // "val": game.type.name
            "val": PLAYER.includes(game.id) ? '+' : roundedVal(game.dl)
        }]
    }
}

function roundedVal(val) {
    if (val < 0) {
        return "-";
    }
    if (val > 7.74) {
        return "8+";
    }
    return "" + Math.round(val * 2) / 2;
}

function segmentClick(e) {
    const id = e.srcElement.__data__.data.game.id;
    window.open("https://rating.chgk.info/tournament/" + id, "_blank")
}

function days(start, end) {
    return Math.floor((end - start) / 1000 / 60 / 60 / 24);
}

function currency(c) {
    return c == "r" ? "руб" : c == "u" ? "usd" : c == "e" ? "eur" : "";
}

function segmentTooltip(e) {
    const g = e.data.game;
    const start = new Date(g.start);
    const end = new Date(g.end);
    const org = g.orgcommittee[0];
    return "<div style='max-width: 250px; font-size: 12px; text-align: left; white-space: normal;'>" +
        "<b>ID:</b> " + g.id + "<br/>" +
        "<b>Игра:</b> " + g.name + "<br/>" +
        "<b>Сложность:</b> " + g.dl + "<br/>" +
        "<b>Оргкомитет:</b> " + org.surname + ", " + org.name + " (" + org.id + ")<br/>" +
        "<b>Вопросы:</b> " + Object.values(g.questionQty).reduce((a, b) => a + b) + "<br/>" +
        "<br/>" +
        "<b>Даты:</b> " + start.toDateString() + " - " + end.toDateString() + "<br/>" +
        "<b>Длительность:</b> " + days(g.start, g.end) + " д<br/>" +
        "<b>До окончания:</b> " + days(NOW, g.end) + " д<br/>" +
        "<br/>" +
        (g.mainPayment == null ? "" : "<b>Стоимость:</b> "
            + g.mainPayment + " " + currency(g.currency) + "<br/>") +
        (g.discountedPayment == null ? "" : "<b>Скидка:</b> "
            + g.discountedPayment + " " + currency(g.currency)
            + " - " + g.discountedPaymentReason + "<br/>") +
        "</div>";
}

function drawGraph(data) {
    TimelinesChart()(document.getElementById("graph"))
        .width(INNER_WIDTH > 600 ? INNER_WIDTH - 40 : 600)
        .maxHeight(2400)
        .maxLineHeight(24)
        //.leftMargin(INNER_WIDTH > 800 ? 100 : 0)
        .leftMargin(0)
        .rightMargin(INNER_WIDTH > 800 ? 300 : 200)
        .dateMarker(new Date())
        .zScaleLabel('Сложность')
        .zQualitative(true)
        .zColorScale(d3.scaleOrdinal().domain(SCALE_DOMAINS).range(SCALE_COLORS))
        .enableOverview(true)
        .onSegmentClick(this.segmentClick)
        .segmentTooltipContent(this.segmentTooltip)
        .data(data);
}

// loadPlayerData().then(() => {
loadData().then(r => {
    TOURS = r[0];
    TOURS_EXTRA = r[1];
    const data = this.prepareData();
    this.displayDataInfoBullet()
    this.drawGraph(data);
});

// });


function displayDataInfoBullet() {
    let period = document.getElementById("period");
    if (period) {
        period.innerText
            = "Запрошены игры, которые начались не раньше " + START_AFTER
            + " (4 месяца назад) и закончились в промежутке с " + END_AFTER
            + " (7 дней назад) до " + END_BEFORE + " (через 4 месяца). "
            + "Найдено игр: " + GAME_COUNT;
    }
}
