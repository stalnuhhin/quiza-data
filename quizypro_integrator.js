const ORG_MAPPING = {
    "БРИЗ": "briz.json",
    "ИZВИЛИУМ": "izvilium.json",
    "online🌎mozgomania.ru": "mozgomania.json",
    "Квизы Скороход": "skorohod.json",
    "Стоп!Снято!": "stopsnyatotlt.json",
    "Tltquiz & ТаБуретКа": "tltquiz.json",
    "ВертиGO": "vertigo.json",
    "NeoQuiz": "neoquiz.json",
    "СибКвиз": "sibkviz.json",
    "Клуб Онлайн Вопросов": "klubonlinevoprosov.json",
    "Online Quiz 64": "onlinequiz64.json",
    "Квиз Марис ": "quizmaris.json",
    "Куб": "sahar.json",
    "ElevenQuiz": "elevenquiz.json",
    "Brain Wars": "brainwars.json",
    "QLEVER - Включай мозги!": "qlever.json",
    "ИнQUIZиция": "inquizicia.json"
};

const app = new Vue({
    el: '#app',
    created() {
        this.load();
    },
    data() {
        return {
            orgsMain: [],
            orgsOther: [],
            orgQPgames: []
        }
    },
    methods: {
        load: function () {
            fetch("https://api.quizy.pro/api/v1/streams?limit=1000&page=0&sort=upcoming")
                .then(r => r.json())
                .then(r => this.fillOrgs(r.data.result));
        },
        getGame: function (g, org) {
            const game = {
                time: g.when,
                name: g.title,
                price: ["" + g.price + " RUB/ком"],
                url: ["https://quizy.pro/streams/" + g.id],
                qpid: g.id,
                qpuid: g.user_id,
                qpuname: g.user_name,
                cat: g.category
            }
            if (org) {
                game.org = org;
            }
            return game;
        },
        addOrgList: function (data, orgName, game) {
            if (!data[orgName]) {
                data[orgName] = [];
            }
            data[orgName].push(game);
        },
        fillOrgs: function (qpGames) {
            const dataMain = {};
            const dataOther = {};

            qpGames.forEach(g => {
                const orgName = g.user_name;
                const jsonFile = ORG_MAPPING[orgName];
                if (jsonFile) {
                    this.addOrgList(dataMain, orgName, this.getGame(g));
                } else {
                    this.addOrgList(dataOther, orgName, this.getGame(g));
                    this.orgQPgames.push(this.getGame(g, orgName));
                }
            });

            this.orgsMain = this.toList(dataMain);
            this.orgsOther = this.toList(dataOther);
            this.orgQPgames.sort((a, b) => a.time - b.time);
        },
        toList: function (data) {
            const result = [];
            Object.keys(data).forEach(key => {
                let jsonFile = ORG_MAPPING[key];
                result.push({
                    orgName: jsonFile ? jsonFile + " - " + key : key,
                    games: data[key]
                });
            });
            result.sort((a, b) => a.orgName.localeCompare(b.orgName));
            result.forEach(o => o.games.sort((a, b) => a.time - b.time));
            return result;
        }
    }
});
