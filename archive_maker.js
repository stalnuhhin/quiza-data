const MONTH = 6; // month number starts from 1, not 0.
const DATAFILES = [
    "3x12trivianights.json",
    "artobstrel.json",
    "beeclever.json",
    "bezdurakov.json",
    "bolshayaigra.json",
    "brainbarquiz.json",
    "brainbattle.json",
    "braindo.json",
    "braingazm.json",
    "brainhub.json",
    "brainwars.json",
    "bquizonline.json",
    "chgkfily.json",
    "chgkrating.json",
    "chesamyjumnyj.json",
    "cityquizkiev.json",
    "cityquizger.json",
    "collection.json",
    "derzhi5.json",
    "diezquiz.json",
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
    "ilovequiz.json",
    "imclub.json",
    "indigo.json",
    "indigosolo.json",
    "intellcasinosanfra.json",
    "intellektualnyykubok.json",
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
    "mzgbtln.json",
    "neoquiz.json",
    "onlinequiz64.json",
    "otvquiz.json",
    "panopticumzhitomir.json",
    "potterquiz.json",
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
    "skorohod.json",
    "smartquiz.json",
    "stopsnyatotlt.json",
    "squiz.json",
    "thequizodessa.json",
    "tltquiz.json",
    "traiduk.json",
    "umforum.json",
    "trequartista.json",
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
            games: []
        }
    },
    methods: {
        load: function () {
            moment.locale("ru");
            const now = moment();
            const dates = [];
            const data = {};

            const promises = DATAFILES.map(file =>
                fetch("data/" + file)
                    .then(r => r.json()));
            Promise.all(promises).then(r => {
                const db = r.flat(2);
                db.forEach(org => {
                    org.games = org.games ? org.games : [];
                    org.games.forEach(game => {
                        game.time = moment(game.time);
                        const tem = game.template ? org.templates[game.template] : {};
                        game.name = game.name || tem.name || org.name;
                        game.duration = game.duration || tem.duration || org.duration;
                        game.image = game.image || tem.image || org.image;
                        game.orgId = org.id;
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

                        if (parseInt(game.time.format('M')) == MONTH) {
                            this.games.push(game);
                        }
                    });
                });
                this.games.sort((a, b) => a.time - b.time);
            });
        }
    }
});
