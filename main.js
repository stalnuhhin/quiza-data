const DATAFILES = [
    "beeclever.json",
    "bezdurakov.json",
    "bquizonline.json",
    "chgkworld.json",
    "cityquizger.json",
    "collection_aggr.json",
    "collection_extra.json",
    "derzhi5.json",
    "einsteinclassic.json",
    "einsteininsta.json",
    "eureka.json",
    "geniumonline.json",
    "imclub.json",
    "indigo.json",
    "inquizicia.json",
    "iqbattleswe.json",
    "kleveria.json",
    "klub60sec.json",
    "klubonlinevoprosov.json",
    "kvizpliz.json",
    "madheadshow.json",
    "mozgomania.json",
    "mzgbtln.json",
    "neoquiz.json",
    "pubquiz.json",
    "quizypro.json",
    "sheikerquiz.json",
    "sibkviz.json",
    "skorohod.json",
    "smartquiz.json",
    "squiz.json",
    "umkaonline.json",
    "zbyshekkviz.json"
]

const time = new Vue({el: '#time'});
const games = new Vue({
    el: '#games',
    created() {
        this.load();
    },
    data() {
        return {
            games: 'loading'
        }
    },
    methods: {
        load: function () {
            moment.locale("ru");
            Promise.all([
                fetch("data/gameorgs.json?" + new Date().getTime()).then(r => r.json()),
                fetch("data/games.json?" + new Date().getTime()).then(r => r.json())])
                .then(r => {
                    this.games = this.process(r[0], r[1]);
                });
        },
        process: function (orgs, games) {
            const result = [];
            games.forEach(g => {
                const o = {}
                o.time = moment(g.time);
                o.name = g.name;
                const type = g.type && orgs[g.type] ? orgs[g.type] : {};
                o.duration = g.duration ? g.duration : type.duration;
                o.image = g.image ? g.image : type.image;
                o.org = g.org ? g.org : type.org;
                o.registration = g.registration ? g.registration : type.registration;
                o.url = g.url ? g.url : [];
                o.url = type.url ? o.url.concat(type.url) : o.url;
                o.pricetype = g.pricetype ? g.pricetype : type.pricetype;
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
                .reduce(function (res, o) {
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

const ressu = new Vue({
    el: '#ressu',
    created() {
        this.load();
    },
    data() {
        return {
            ressources: 'loading'
        }
    },
    methods: {
        load: function () {
            fetch("data/ressources.json?" + new Date().getTime())
                .then(r => r.json())
                .then(r => {
                    this.ressources = this.process(r);
                });
        },
        process: function (rs) {
            const main = [];
            const extra = [];
            rs.forEach(r => {
                r.check = r.check ? moment(r.check) : undefined;
                r.hasEvent ? main.push(r) : extra.push(r);
            });
            main.sort((a, b) => a.check - b.check);
            extra.sort((a, b) => a.name - b.name);
            return {main, extra};
        }
    }
});