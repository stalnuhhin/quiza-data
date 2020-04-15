const DATA_VERSION = 6;
const DATAFILES = [
    "3x12trivianights.json",
    "beeclever.json",
    "bezdurakov.json",
    "brainbarquiz.json",
    "brainbattle.json",
    "braindo.json",
    "braingazm.json",
    "brainhub.json",
    "brainwars.json",
    "bquizonline.json",
    "chgkrating.json",
    "chgkworld.json",
    "chesamyjumnyj.json",
    "cityquizkiev.json",
    "cityquizger.json",
    "collection.json",
    "derzhi5.json",
    "einsteinparty.json",
    "einsteinpartybel.json",
    "elevenquiz.json",
    "eureka.json",
    "gameon.json",
    "geniumonline.json",
    "goquiz.json",
    "headtrick.json",
    "igravpass.json",
    "ilovequiz.json",
    "imclub.json",
    "indigo.json",
    "indigosolo.json",
    "intellcasinosanfra.json",
    "inquizicia.json",
    "iqbattle.json",
    "iqbattleswe.json",
    "irkutskznatochje.json",
    "kievchgk.json",
    "kleveria.json",
    "klub60sec.json",
    "klub60secgatchina.json",
    "klubonlinevoprosov.json",
    "kvizhn.json",
    "kvizplizmsk.json",
    "kvizplizspb.json",
    "madheadshow.json",
    "manhattanclub.json",
    "mozgomania.json",
    "mzgb.json",
    "mzgbtln.json",
    "neoquiz.json",
    "onlinequiz64.json",
    "panopticumzhitomir.json",
    "potterquiz.json",
    "pubquiz.json",
    "quantum.json",
    "quizfun.json",
    "quizium.json",
    "quiznightdp.json",
    "quizypro.json",
    "quriosity.json",
    "sahar.json",
    "sheikerquiz.json",
    "sherlockquiz.json",
    "sibkviz.json",
    "skorohod.json",
    "smartquiz.json",
    "squiz.json",
    "thequizodessa.json",
    "umforum.json",
    "umkaonline.json",
    "urok.json",
    "uznavaizing.json",
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
                fetch("data/" + file + "?" + DATA_VERSION)
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
                        game.lang = game.lang || tem.lang || org.lang;
                        game.noregistration = game.noregistration || tem.noregistration || org.noregistration;
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
        },
        getUrlName: function (url, index) {
            if (url.includes("vk.com")) {
                if (url.includes("?w=")) {
                    return 'VK post';
                }
                if (url.includes("/topic-")) {
                    return 'VK topic';
                }
                return 'VKontakte';
            }
            if (url.includes("facebook.com")) {
                if (url.includes("/events/")) {
                    return 'FB event';
                }
                return 'Facebook';
            }
            if (url.includes("quizy.pro/streams/")) {
                return 'Стрим на Quizy'
            }
            if (url.includes("youtube.com")) {
                return 'Youtube';
            }
            if (url.includes("instagram.com")) {
                return 'Instagram';
            }
            if (url.includes(".t.me")
                || url.includes("//t.me")
                || url.includes("ttttt.me")) {
                return 'Telegram';
            }
            if (url.includes("twitch.tv")) {
                return 'Twitch';
            }
            return this.extractHostname(url);
        },
        extractHostname: function (url) {
            var hostname;
            //find & remove protocol (http, ftp, etc.) and get hostname
            if (url.indexOf("//") > -1) {
                hostname = url.split('/')[2];
            } else {
                hostname = url.split('/')[0];
            }

            //find & remove port number
            hostname = hostname.split(':')[0];
            //find & remove "?"
            hostname = hostname.split('?')[0];

            return hostname.startsWith('www.') ? hostname.substring(4) : hostname;
        }
    }
});