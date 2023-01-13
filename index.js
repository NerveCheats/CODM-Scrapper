const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const dataToJsonFile = (data) => {
   fs.writeFile("data.json", data, "binary", (err) => {
      if (err) throw err;
      console.log("Data saved in data.json");
   });
}

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
                  resolve(data);
               }

            };
         });
   });
};

function jsonConcat(o1, o2) {
   for (var key in o2) {
      o1[key] = o2[key];
   }
   return o1;
}

async function main() {
   const data = await getCategory();
   var output = {};

   for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
         const element = data[key];

         const category = element.replace(" ", "_").toLowerCase();
         console.info("Weapon Category : ", element);
         const weapon = await getWeapon(element, category);
         output = jsonConcat(output, weapon);
      }
   }

   var result = JSON.stringify(output, null, 2);
   dataToJsonFile(result);
}

main();