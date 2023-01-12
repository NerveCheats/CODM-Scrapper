const axios = require('axios');
const cheerio = require('cheerio');

const getCategory = () => {
   return new Promise((resolve, reject) => {
      axios.get("https://main.codm.garena.co.id/guide/weapons/assault_rifle")
         .then(req => {
            const category = [];
            const $ = cheerio.load(req.data);
            const weaponLayout = $('div[id="WeaponLayout"]');
            weaponLayout.find("ul li").each(function (_, e) {
               category.push($(e).text());
            });

            if (category != undefined) {
               resolve(category);
            } else {
               reject("Empty data");
            }
         });
   });
}

const getWeapon = (weaponCategory, weaponType) => {
   return new Promise((resolve, reject) => {
      axios.get(`https://main.codm.garena.co.id/guide/weapons/${weaponType}`)
         .then(req => {
            const title = [];
            const img = [];

            const data = {};
            data[weaponCategory] = [];

            const $ = cheerio.load(req.data);
            const weaponList = $("div.weapon-list__list");
            weaponList.each(function (i, e) {
               title.push($(e).find("div.name-cont").text());
               img.push($(e).find("div.image-cont").find("img").attr('src'));
            });
            if (title == undefined || img == undefined) {
               reject("Empty Data!");
            } else {

               var i;
               for (i = 0; i < title.length; i++) {
                  let isi = {
                     "title": title[i],
                     "img": img[i]
                  }
                  data[weaponCategory].push(isi);
               }

               if (data == undefined) {
                  reject("No result :(");
               } else {
                  var result = JSON.stringify(data, null, 2);
                  resolve(result);
               }

            };
         });
   });
};

getCategory().then(data => {
   data.forEach(e => {
      const category = e.replace(" ", "_").toLowerCase();
      console.info("Weapon Category : ", e);

      getWeapon(e, category).then(weapon => {
         console.log(weapon);
      }, errs => {
         console.error(errs);
      })
   })
}, err => {
   console.error(err);
});