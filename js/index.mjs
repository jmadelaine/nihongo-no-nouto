import verbs from './verbs.mjs'
import adverbs from './adverbs.mjs'
import nouns from './nouns.mjs'

const getAudioSrc = async text => {
  const res = await (
    await fetch('https://api.soundoftext.com/sounds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: { text, voice: 'ja-JP' },
        engine: 'Google',
      }),
    })
  ).json()
  return res.success ? `https://files.soundoftext.com/${res.id}.mp3` : undefined
}

const player = new Audio()
const speak = async text => {
  player.pause()
  player.src = await getAudioSrc(text)
  player.load()
  player.playbackRate = 1.125
  player.play()
}

const listEl = document.getElementById('phrase-list')

const createCards = data => {
  data = data.sort((a, b) => ((b.furigana ?? b.kana) > (a.furigana ?? a.kana) ? -1 : 1))

  data.forEach(d => {
    const wrapperEl = document.createElement('div')
    wrapperEl.classList.add('phrase-wrapper', 'col')
    listEl.appendChild(wrapperEl)

    const mainSectionEl = document.createElement('div')
    mainSectionEl.classList.add('card-main-section')
    if (d.partOfSpeech) mainSectionEl.classList.add(`part-of-speech-${d.partOfSpeech}`)
    wrapperEl.appendChild(mainSectionEl)

    const kanaRowEl = document.createElement('div')
    kanaRowEl.classList.add('row', 'gap-md')
    mainSectionEl.appendChild(kanaRowEl)

    const kanaEl = document.createElement('span')
    kanaEl.innerText = d.kana
    kanaEl.classList.add('playable', 'kana')
    kanaEl.addEventListener('click', () => speak(d.kana))
    kanaRowEl.appendChild(kanaEl)

    if (d.furigana) {
      const furiganaEl = document.createElement('span')
      furiganaEl.classList.add('furigana')
      furiganaEl.innerText = d.furigana
      kanaRowEl.appendChild(furiganaEl)
    }

    const detailsEl = document.createElement('div')
    detailsEl.classList.add('row', 'gap-md')
    mainSectionEl.appendChild(detailsEl)

    const translationEl = document.createElement('div')
    translationEl.classList.add('translation')
    translationEl.innerText = d.translation
    detailsEl.appendChild(translationEl)

    if (d.partOfSpeech) {
      const partOfSpeechEl = document.createElement('div')
      partOfSpeechEl.classList.add('part-of-speech')
      partOfSpeechEl.innerText = d.partOfSpeech
      detailsEl.appendChild(partOfSpeechEl)
    }

    if (d.examples && d.examples.length) {
      const examplesEl = document.createElement('div')
      if (d.partOfSpeech) examplesEl.classList.add(`part-of-speech-${d.partOfSpeech}-examples`)
      examplesEl.classList.add('card-examples-section', 'col')
      d.examples.forEach(example => {
        const exampleEl = document.createElement('div')
        exampleEl.classList.add('col')
        const exampleKanaEl = document.createElement('div')
        exampleKanaEl.innerText = example.kana
        exampleKanaEl.classList.add('playable', 'example-kana')
        exampleKanaEl.addEventListener('click', () => speak(example.kana))
        exampleEl.appendChild(exampleKanaEl)
        const exampleTranslationEl = document.createElement('div')
        exampleTranslationEl.classList.add('example-translation')
        exampleTranslationEl.innerText = example.translation
        exampleEl.appendChild(exampleTranslationEl)
        examplesEl.appendChild(exampleEl)
      })
      wrapperEl.appendChild(examplesEl)
    }
  })
}

const createSubheading = text => {
  const el = document.createElement('div')
  el.classList.add('subheading')
  el.innerHTML = text
  listEl.appendChild(el)
}

createSubheading('Adverbs')
createCards(adverbs.map(v => ({ ...v, partOfSpeech: 'adverb' })))
createSubheading('Verbs')
createCards(verbs.map(v => ({ ...v, partOfSpeech: 'verb' })))
createSubheading('Nouns')
createCards(nouns.map(v => ({ ...v, partOfSpeech: 'noun' })))
