const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const sharp = require('sharp');

const readFileAsync = (fileName) => {
   return new Promise((resolve, reject) => {
      fs.readFile(fileName, (err, data) => {
         if (err)
            reject(err);
         resolve(data);
      });
   });
}

const dataToJsonFile = (data) => {
   fs.writeFile("data.json", data, "binary", (err) => {
      if (err) throw err;
      console.log("Data saved in data.json");
   });
}

const getWeaponDatas = () => {
   return new Promise((resolve, reject) => {
      axios.get(`https://main.codm.garena.co.id/guide/weapons/assault_rifle`)
         .then(req => {
            const data = {};

            const $ = cheerio.load(req.data);

            const weaponCategoryList = $("div.tabs__content div.tab-container__content");

            weaponCategoryList.each(function (_, category) {
               const title = [];
               const img = [];

               const tCategory = $(category).find("span.title").text();

               data[tCategory] = [];

               const weaponList = $(category).find("div.weapon-list div.weapon-list__list div.left");

               weaponList.find("div.name-cont").each(function (_, e) {
                  title.push($(e).text());
               })

               weaponList.find("div.image-cont img").each(function (_, e) {
                  img.push($(e).attr('src'))
               })

               if (title == undefined || img == undefined) {
                  reject("Error occured title or image");
               }

               for (let index = 0; index < title.length; index++) {
                  let isi = {
                     "title": title[index],
                     "img": img[index]
                  }

                  data[tCategory].push(isi);
               }
            });

            if (data == undefined) {
               reject("No result :(");
            } else {
               resolve(data);
            }

         });
   });
};

async function fetchServerData() {
   const output = await getWeaponDatas();

   var result = JSON.stringify(output, null, 2);

   dataToJsonFile(result);
}

async function saveImgFromJsonFile() {
   const rawData = await readFileAsync("data.json");
   const data = JSON.parse(rawData.toString());

   for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
         const arrData = data[key];

         for (const jWeapon in arrData) {
            if (Object.hasOwnProperty.call(arrData, jWeapon)) {
               const element = arrData[jWeapon];
               const imageRaw = await axios.get(element["img"], { responseType: 'arraybuffer' });

               const imageExtensionRaw = element["img"].split(".");
               const imageExtension = imageExtensionRaw[imageExtensionRaw.length - 1];

               const imageNameRaw = element["title"].replaceAll(" ", "-");
               const imageName = imageNameRaw + "." + imageExtension;

               fs.mkdir("IconHD", (err) => { });
               fs.writeFile(`IconHD/${imageName}`, imageRaw.data, "binary", (err) => {
                  if (err) throw err;
                  console.log("Download: ", imageName);
               });
            }
         }
      }
   }
}

async function resizeDownloadImage() {
   const rawData = await readFileAsync("data.json");
   const data = JSON.parse(rawData.toString());

   for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
         const arrData = data[key];

         for (const jWeapon in arrData) {
            const element = arrData[jWeapon];

            const imageExtensionRaw = element["img"].split(".");
            const imageExtension = imageExtensionRaw[imageExtensionRaw.length - 1];

            const imageNameRaw = element["title"].replaceAll(" ", "-");
            const imageName = imageNameRaw + "." + imageExtension;

            fs.mkdir("Icon", (err) => { });
            sharp(`IconHD/${imageName}`)
               .resize(60)
               .toFile(`Icon/${imageName}`, (err, info) => {
                  if (err)
                     console.error(err);
                  else
                     console.log("Resize: ", imageName);
               })
         }
      }
   }
}

/**
 * If you want to fetch data from server use :
 * main();
 * 
 * If you want to save image data from server use :
 * saveImgFromJsonFile();
 * 
 * If you want to resize all the image use :
 * resizeDownloadImage();
 * 
 */
async function main() {
   await fetchServerData();
   await saveImgFromJsonFile();
   await resizeDownloadImage();
}

main();