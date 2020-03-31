const gm = new Vue({
    el: '#app',
    created() {
        this.init();
        this.load();
    },
    data() {
        return {
            now: moment(),
            games: 'loading'
        }
    },
    methods: {
        init: function () {
            moment.locale("ru");
        },
        load: function () {
            Promise.all([
                fetch(`data/gameorgs.json`).then(r => r.json()),
                fetch(`data/games.json`).then(r => r.json())])
                .then(r => {
                    this.games = this.process(r[0], r[1]);
                });
        },
        fillItem: function (o, g, type) {
            o.org = g.org ? g.org : type.org
            if (g.org) {

            }
        },
        groupBy: function(xs, key) {
            return
        },
        process: function (orgs, games) {
            const result = [];
            games.forEach(g => {
                const o = {}
                o.time = moment(g.time);
                o.duration = g.duration;
                o.name = g.name;
                const type = g.type && orgs[g.type] ? orgs[g.type] : {};
                o.org = g.org ? g.org : type.org;
                o.registration = g.registration ? g.registration : type.registration;
                o.url = g.url ? g.url : type.url;
                o.price = g.price ? g.price : type.price;
                o.currency = g.currency ? g.currency : type.currency;
                o.info = g.info ? g.info : type.info;
                o.payment = g.payment ? g.payment : type.payment;
                result.push(o);
            });
            const now = moment();
            const dates = [];
            const data = result
                .filter(o => now.isBefore(moment(o.time).add(o.duration, 'hours')))
                .sort((a, b) => a.time - b.time)
                .reduce(function(res, o) {
                    const key = o.time.format('YYYYMMDD');
                    if (!res[key]) {
                        res[key] = [];
                        dates.push(key);
                    }
                    res[key].push(o);
                    return res;
                }, {});
            return {dates, data}
        }
    }
});