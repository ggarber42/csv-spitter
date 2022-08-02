// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const puppeteer = require("puppeteer");
const moment = require('moment')
const fs = require("fs");


window.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('button')
  const header = document.querySelector('header h2')

  button.addEventListener('click', async function () {
    header.textContent = 'calma aí, tô lutando aqui...'
    this.disabled = true
    const FOLDER_URL = 'https://onedrive.live.com/?authkey=%21ANM36tMw61wOHh8&id=460B3B59F851FE1B%21109192&cid=460B3B59F851FE1B'
    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()

    await page.goto(FOLDER_URL)
    await page.waitForTimeout(5000)

    const VIDEO_URLS = await page.evaluate(_ => {
      const thumbnails = Array.from(document.querySelectorAll('a.ms-Tile-link'))
      return thumbnails.reduce((urls, thumb) => [...urls, thumb.href], [])
    })
    const VIDEOS_INFO = []

    for (const video of VIDEO_URLS) {
      await page.goto(video)
      await page.waitForTimeout(5000)
      await page.click('button[title*="Info"]')
      await page.waitForTimeout(4000)
      await page.click('button.od-DetailsPane-SecondaryPane-header')
      await page.waitForTimeout(4000)
      const { hiperlink, idArquivo, data, horaRaw } = await page.evaluate(_ => {
        const hiperlink = window.location.href
        const idArquivo = document.querySelector('.OneUp-infoPane h2.od-DetailsPane-PrimaryPane-header-title').textContent

        const infoSection = document.querySelector('dl.InfoPaneSection-informationBody')
        const rawDate = infoSection.querySelector('dd:nth-child(4)').textContent
        const [data, ...rawTime] = rawDate.split(/\s/)
        const horaRaw = rawTime.reduce((hora, element) => hora + ' ' + element, '')
        return {
          hiperlink,
          idArquivo,
          data,
          horaRaw
        }
      })
      const horaInicio = moment(horaRaw, "h:mm:ss A").format("HH:mm")
      VIDEOS_INFO.push({ hiperlink, idArquivo, data, horaInicio })
      console.log(VIDEOS_INFO)
    }
    let output
    for (const info of VIDEOS_INFO) {
      output += `${info.hiperlink},${info.idArquivo},${info.data},${info.horaInicio},`
    }
    fs.writeFileSync("spitted.csv", output);
    await browser.close();
  })

})
