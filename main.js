const DATAFILES = [
    "beeclever.json",
    "bezdurakov.json",
    "braingazm.json",
    "brainhub.json",
    "bquizonline.json",
    "chgkrating.json",
    "cityquizger.json",
    "collection.json",
    "derzhi5.json",
    "einsteinparty.json",
    "einsteinpartybel.json",
    "eureka.json",
    "footballsi.json",
    "geniumonline.json",
    "ilovequiz.json",
    "imclub.json",
    "indigo.json",
    "indigosolo.json",
    "intellcasinosanfra.json",
    "inquizicia.json",
    "iqbattle.json",
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
    "quantum.json",
    "quizfun.json",
    "quizypro.json",
    "sahar.json",
    "sheikerquiz.json",
    "sherlockquiz.json",
    "sibkviz.json",
    "skorohod.json",
    "smartquiz.json",
    "squiz.json",
    "umforum.json",
    "umkaonline.json",
    "urok.json",
    "vertigo.json",
    "wowquiz.json",
    "yokviz.json",
    "zbyshekkviz.json"
]

const app = new Vue({
    el: '#app',
    created() {
        this.load();
    },
    data() {
        return {
            filter: {},
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
                    if (org.type.includes('events')) {
                        this.rsMain.push(org);
                    }
                    if (org.type.includes('aggr')) {
                        this.rsAggr.push(org);
                    }
                    if (org.type.includes('extra')) {
                        this.rsExtra.push(org);
                    }
                    org.games = org.games ? org.games : [];
                    org.games.forEach(game => {
                        game.time = moment(game.time);
                        const tem = game.template ? org.templates[game.template] : {};
                        game.name = game.name || tem.name || org.name;
                        game.duration = game.duration || tem.duration || org.duration;
                        game.image = game.image || tem.image || org.image;
                        game.org = game.org || tem.org || org.org;
                        game.chgk = game.chgk || tem.chgk || org.chgk;
                        game.registration = game.registration || tem.registration || org.registration;
                        game.url = game.url || [];
                        game.url = org.url ? game.url.concat(org.url) : game.url;
                        game.url = tem.url ? game.url.concat(tem.url) : game.url;
                        game.free = game.free || tem.free || org.free;
                        game.donate = game.donate || tem.donate || org.donate;
                        game.price = game.price || tem.price || org.price;
                        game.desc = game.desc || tem.desc || org.desc;
                        game.info = game.info || tem.info || org.info;
                        game.payment = game.payment || tem.payment || org.payment;

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
                    org.games.sort((a, b) => a.time - b.time)
                    org.latestGameTime = org.games.length > 0 ? org.games[org.games.length - 1].time : moment().add(-1, 'years');
                });
                const compareFn = (a, b) => a.org.localeCompare(b.org);
                this.rsMain.sort(compareFn);
                this.rsExtra.sort(compareFn);
                this.rsAggr.sort(compareFn);
                dates.sort();
                this.activeGames = {dates, data};
                this.filter = {
                    mode: undefined
                }
            });
        },
        sort: function (type) {
            this.rsMain.sort((a, b) => {
                switch (type) {
                    case 'game':
                        return a.latestGameTime - b.latestGameTime;
                    case 'check':
                        return a.latestCheck - b.latestCheck;
                    case 'name':
                        return a.org.localeCompare(b.org);
                }
            });
        }
    }
});