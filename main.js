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

const app = new Vue({
    el: '#app',
    created() {
        this.load();
    },
    data() {
        return {
            activeGames: [],
            rsAggr: [],
            rsMain: [],
            rsExtra: []
        }
    },
    methods: {
        load: function () {
            moment.locale("ru");
            const now = moment();
            const dates = [];
            const data = {};

            const promises = DATAFILES.map(file =>
                fetch("data/" + file + "?" + new Date().getTime())
                    .then(r => r.json()));
            Promise.all(promises).then(r => {
                const db = r.flat(2);
                db.forEach(org => {
                    org.latestCheck = org.latestCheck ? moment(org.latestCheck) : undefined;
                    switch (org.type) {
                        case 'events':
                            this.rsMain.push(org);
                            break;
                        case 'aggr':
                            this.rsAggr.push(org);
                            break;
                        default:
                            this.rsExtra.push(org);
                    }
                    org.games = org.games ? org.games : [];
                    org.games.forEach(game => {
                        game.time = moment(game.time);
                        game.duration = game.duration || org.duration;
                        game.image = game.image || org.image;
                        game.org = game.org || org.org;
                        game.registration = game.registration || org.registration;
                        game.url = game.url || [];
                        game.url = org.url ? game.url.concat(org.url) : game.url;
                        game.free = game.free || org.free;
                        game.donate = game.donate || org.donate;
                        game.price = game.price || org.price;
                        game.desc = game.desc || org.desc;
                        game.info = game.info || org.info;
                        game.payment = game.payment || org.payment;

                        if (now.isBefore(moment(game.time).add(game.duration, 'hours'))) {
                            const key = game.time.format('YYYYMMDD');
                            if (!data[key]) {
                                data[key] = [];
                                dates.push(key);
                            }
                            data[key].push(game);
                        }

                        for (let [key, list] of Object.entries(data)) {
                            list.sort((a, b) => a.time - b.time);
                        }
                    });
                });
                this.rsMain.sort((a, b) => a.latestCheck - b.latestCheck);
                this.rsExtra.sort((a, b) => a.name - b.name);
                this.rsAggr.sort((a, b) => a.name - b.name);
                dates.sort();
                this.activeGames = {dates, data};
            });
        }
    }
});