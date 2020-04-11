const DATAFILES = [
    "beeclever.json?1",
    "bezdurakov.json?1",
    "brainbarquiz.json",
    "brainbattle.json?1",
    "braindo.json?2",
    "braingazm.json?1",
    "brainhub.json?1",
    "bquizonline.json?1",
    "chgkrating.json?2",
    "chgkworld.json",
    "chesamyjumnyj.json",
    "cityquizkiev.json",
    "cityquizger.json?1",
    "collection.json",
    "derzhi5.json?1",
    "einsteinparty.json?1",
    "einsteinpartybel.json?1",
    "elevenquiz.json",
    "eureka.json?1",
    "footballsi.json?1",
    "geniumonline.json?1",
    "goquiz.json",
    "headtrick.json?1",
    "ilovequiz.json?1",
    "imclub.json?1",
    "indigo.json?1",
    "indigosolo.json?1",
    "intellcasinosanfra.json?1",
    "inquizicia.json?2",
    "iqbattle.json?2",
    "iqbattleswe.json?1",
    "irkutskznatochje.json",
    "kleveria.json?1",
    "klub60sec.json?1",
    "klubonlinevoprosov.json?1",
    "kvizhn.json",
    "kvizpliz.json?1",
    "madheadshow.json?2",
    "mozgomania.json?3",
    "mzgb.json?1",
    "mzgbtln.json?1",
    "neoquiz.json?1",
    "onlinequiz64.json?1",
    "panopticumzhitomir.json",
    "potterquiz.json",
    "pubquiz.json?1",
    "quantum.json",
    "quizfun.json?2",
    "quizium.json",
    "quiznightdp.json",
    "quizypro.json?2",
    "sahar.json?1",
    "sheikerquiz.json?1",
    "sherlockquiz.json?1",
    "sibkviz.json?2",
    "skorohod.json?1",
    "smartquiz.json?1",
    "squiz.json?1",
    "thequizodessa.json?1",
    "umforum.json?1",
    "umkaonline.json?3",
    "urok.json",
    "uznavaizing.json",
    "vertigo.json?1",
    "wowquiz.json?1",
    "yokviz.json?1",
    "zbyshekkviz.json?1"
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
                fetch("data/" + file) // + "?" + new Date().getTime())
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