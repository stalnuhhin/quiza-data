const DATA_VERSION = 355;
const DATAFILES = [
    "3x12trivianights.json",
    "artobstrel.json",
    "batsian.json",
    "beeclever.json",
    "bezdurakov.json",
    "bezumnyjimperator.json",
    "bolshayaigra.json",
    "brainbarquiz.json",
    "brainbattle.json",
    "braindo.json",
    "braingazm.json",
    "brainhub.json",
    "brainventura.json",
    "brainwars.json",
    "briz.json",
    "bquizonline.json",
    "chgkfily.json",
    "chgkrating.json",
    "chesamyjumnyj.json",
    "cityquizkiev.json",
    "cityquizger.json",
    "collection.json",
    "derzhi5.json",
    "diezquiz.json",
    "dziamyantsau.json",
    "harkovonline.json",
    "einsteinparty.json",
    "einsteinpartybel.json",
    "elevenquiz.json",
    "eveningquiz.json",
    "eurekaonline.json",
    "fmquiz.json",
    "gameon.json",
    "geniumonline.json",
    "gonchar.json",
    "goquiz.json",
    "headtrick.json",
    "igravpass.json",
    "igryrazuma.json",
    "igryvsempomoshchjsirotam.json",
    "ilovequiz.json",
    "imclub.json",
    "indigo.json",
    "indigosolo.json",
    "intellcasinosanfra.json",
    "intellektualnyykubok.json",
    "interoves.json",
    "inquizitor.json",
    "inquizicia.json",
    "iqbattle.json",
    "iqbattleswe.json",
    "iqgamesmd.json",
    "irkutskznatochje.json",
    "izvilium.json",
    "jackquiz.json",
    "kievchgk.json",
    "kleveria.json",
    "klub60sec.json",
    "klub60secgatchina.json",
    "klubonlinevoprosov.json",
    "krugov.json",
    "kviz8.json",
    "kvizhn.json",
    "kvizplizmsk.json",
    "kvizplizspb.json",
    "madheadshow.json",
    "manhattanclub.json",
    "mindgamesmd.json",
    "mozgomania.json",
    "mzgb.json",
    "neoquiz.json",
    "omg.json",
    "onlinequiz64.json",
    "otvquiz.json",
    "panopticumzhitomir.json",
    "pohjaookull.json",
    "potterquiz.json",
    "premierchgkonline.json",
    "pubquiz.json",
    "qlever.json",
    "quiz77.json",
    "quizfun.json",
    "quizheroes.json",
    "quizium.json",
    "quizmaris.json",
    "quizmich.json",
    "quiznightdp.json",
    "quiztimekr.json",
    "quizypro.json",
    "quriosity.json",
    "sahar.json",
    "sheikerquiz.json",
    "sherlockquiz.json",
    "sibkviz.json",
    "sidorenkov.json",
    "skorohod.json",
    "smartquiz.json",
    "stopsnyatotlt.json",
    "squiz.json",
    "thegameua.json",
    "thequizodessa.json",
    "tltquiz.json",
    "trequartista.json",
    "umforum.json",
    "umapalatadetskaja.json",
    "umkaquiz.json",
    "umkaonline.json",
    "urok.json",
    "uznavaizing.json",
    "vertigo.json",
    "wednesdaypubquiz.json",
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
            rsMainClosed: [],
            rsExtra: [],
            gameCount: 0
        }
    },
    methods: {
        isNewTime: function(time) {
            const newTime = time.format("DDMMYYYY-HHmm");
            const timeChanged = newTime != window.iterTime;
            window.iterTime = newTime;
            return timeChanged;
        },
        load: async function () {
            const fileGroups = this.splitArray(DATAFILES, 20);
            this.loadGroupChain([], fileGroups, 0);
        },
        loadGroupChain: function (db, fileGroups, count) {
            if (fileGroups.length <= count) {
                this.processData(db);
                return;
            }
            this.loadGroup(fileGroups[count]).then(r => {
                db = db.concat(r);
                this.loadGroupChain(db, fileGroups, count+1);
            })
        },
        loadGroup: function (files) {
            const promises = files.map(file =>
                fetch("data/" + file + "?" + DATA_VERSION)
                    .then(r => r.json()));
            return Promise.all(promises).then(r => {
                return r.flat(2);
            });
        },
        processData: function(db) {
            moment.locale("ru");
            const now = moment();
            const dates = [];
            const data = {};

            db.forEach(org => {
                org.latestCheck = org.latestCheck ? moment(org.latestCheck) : undefined;
                if (org.type.includes('events')) {
                    if (org.noOnline) {
                        this.rsMainClosed.push(org);
                    } else {
                        this.rsMain.push(org);
                    }
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
                    game.chgk = game.chgk || (game.chgk === undefined && tem.chgk);
                    game.chgk = game.chgk || (game.chgk === undefined && org.chgk);
                    game.lang = game.lang || tem.lang || org.lang;
                    game.noregistration = game.noregistration || (game.noregistration === undefined && tem.noregistration);
                    game.noregistration = game.noregistration || (game.noregistration === undefined && org.noregistration);
                    game.url = game.url || [];
                    game.url = tem.url ? game.url.concat(tem.url) : game.url;
                    game.url = org.url ? game.url.concat(org.url) : game.url;
                    game.free = game.free || (game.free === undefined && tem.free);
                    game.free = game.free || (game.free === undefined && org.free);
                    game.donate = game.donate || (game.donate === undefined && tem.donate);
                    game.donate = game.donate || (game.donate === undefined && org.donate);
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
                        this.gameCount++;
                    }

                    for (let [key, list] of Object.entries(data)) {
                        list.sort((a, b) => a.time - b.time);
                    }
                });
                org.games.sort((a, b) => a.time - b.time)
                org.latestGameTime = org.games.length > 0 ? org.games[org.games.length - 1].time : null;
            });
            const compareFn = (a, b) => a.org.localeCompare(b.org);
            this.rsMain.sort(compareFn);
            this.rsMainClosed.sort(compareFn);
            this.rsExtra.sort(compareFn);
            this.rsAggr.sort(compareFn);
            dates.sort();
            this.activeGames = {dates, data};
            this.filter = {
                mode: undefined
            }
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
        },
        splitArray: function(array, quantity) {
            var result = [];
            while (array[0]) {
                result.push(array.splice(0, quantity))
            }
            return result;
        }
    }
});
