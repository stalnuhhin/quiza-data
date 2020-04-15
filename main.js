const DATAFILES = [
    "beeclever.json?2",
    "bezdurakov.json?2",
    "brainbarquiz.json?2",
    "brainbattle.json?2",
    "braindo.json?3",
    "braingazm.json?3",
    "brainhub.json?3",
    "brainwars.json",
    "bquizonline.json?2",
    "chgkrating.json?4",
    "chgkworld.json?2",
    "chesamyjumnyj.json?2",
    "cityquizkiev.json?2",
    "cityquizger.json?3",
    "collection.json?2",
    "derzhi5.json?2",
    "einsteinparty.json?3",
    "einsteinpartybel.json?4",
    "elevenquiz.json?3",
    "eureka.json?2",
    "gameon.json",
    "geniumonline.json?3",
    "goquiz.json?3",
    "headtrick.json?2",
    "igravpass.json?2",
    "ilovequiz.json?3",
    "imclub.json?2",
    "indigo.json?2",
    "indigosolo.json?2",
    "intellcasinosanfra.json?2",
    "inquizicia.json?3",
    "iqbattle.json?4",
    "iqbattleswe.json?2",
    "irkutskznatochje.json?2",
    "kleveria.json?2",
    "klub60sec.json?2",
    "klub60secgatchina.json",
    "klubonlinevoprosov.json?3",
    "kvizhn.json?2",
    "kvizplizmsk.json",
    "kvizplizspb.json",
    "madheadshow.json?3",
    "mozgomania.json?5",
    "mzgb.json?2",
    "mzgbtln.json?2",
    "neoquiz.json?2",
    "onlinequiz64.json?2",
    "panopticumzhitomir.json?2",
    "potterquiz.json?2",
    "pubquiz.json?3",
    "quantum.json?2",
    "quizfun.json?4",
    "quizium.json?3",
    "quiznightdp.json?2",
    "quizypro.json?4",
    "quriosity.json",
    "sahar.json?3",
    "sheikerquiz.json?2",
    "sherlockquiz.json?2",
    "sibkviz.json?4",
    "skorohod.json?3",
    "smartquiz.json?3",
    "squiz.json?2",
    "thequizodessa.json?2",
    "umforum.json?2",
    "umkaonline.json?5",
    "urok.json?3",
    "uznavaizing.json?2",
    "vertigo.json?2",
    "wowquiz.json?3",
    "yokviz.json?2",
    "zbyshekkviz.json?2"
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