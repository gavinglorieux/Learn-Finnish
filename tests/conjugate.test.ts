import { test } from 'node:test'
import assert from 'node:assert/strict'
import { conjugate, detectVerbType, weakenStem, strengthenStem, harmonyA } from '../src/data/conjugate.ts'

const forms = (inf: string) => Object.values(conjugate(inf).forms).join(' ')

test('verb type detection', () => {
  assert.equal(detectVerbType('puhua'), 1)
  assert.equal(detectVerbType('tietää'), 1)
  assert.equal(detectVerbType('syödä'), 2)
  assert.equal(detectVerbType('tehdä'), 2)
  assert.equal(detectVerbType('tulla'), 3)
  assert.equal(detectVerbType('mennä'), 3)
  assert.equal(detectVerbType('nousta'), 3)
  assert.equal(detectVerbType('purra'), 3)
  assert.equal(detectVerbType('haluta'), 4)
  assert.equal(detectVerbType('herätä'), 4)
  assert.equal(detectVerbType('tarvita'), 5)
  assert.equal(detectVerbType('vanheta'), 6)
  assert.equal(conjugate('hävitä').type, 4)
})

test('vowel harmony', () => {
  assert.equal(harmonyA('talo'), 'a')
  assert.equal(harmonyA('tyttö'), 'ä')
  assert.equal(harmonyA('tie'), 'ä')
})

test('gradation helpers', () => {
  assert.equal(weakenStem('nukku'), 'nuku')
  assert.equal(weakenStem('tietä'), 'tiedä')
  assert.equal(weakenStem('luke'), 'lue')
  assert.equal(weakenStem('anta'), 'anna')
  assert.equal(weakenStem('lähte'), 'lähde')
  assert.equal(weakenStem('kulke'), 'kulje')
  assert.equal(weakenStem('istu'), 'istu') // st never alternates
  assert.equal(strengthenStem('ajate'), 'ajatte')
  assert.equal(strengthenStem('kuunne'), 'kuunte')
  assert.equal(strengthenStem('pudo'), 'puto')
  assert.equal(strengthenStem('ava'), 'ava') // v → p only for listed verbs
  assert.equal(strengthenStem('tava', true), 'tapa')
})

test('type 1 with and without KPT', () => {
  assert.equal(forms('puhua'), 'puhun puhut puhuu puhumme puhutte puhuvat')
  assert.equal(forms('nukkua'), 'nukun nukut nukkuu nukumme nukutte nukkuvat')
  assert.equal(forms('tietää'), 'tiedän tiedät tietää tiedämme tiedätte tietävät')
  assert.equal(forms('lukea'), 'luen luet lukee luemme luette lukevat')
  assert.equal(forms('ottaa'), 'otan otat ottaa otamme otatte ottavat')
  assert.equal(forms('antaa'), 'annan annat antaa annamme annatte antavat')
  assert.equal(forms('lähteä'), 'lähden lähdet lähtee lähdemme lähdette lähtevät')
  assert.equal(forms('oppia'), 'opin opit oppii opimme opitte oppivat')
  assert.equal(forms('sopia'), 'sovin sovit sopii sovimme sovitte sopivat')
  assert.equal(forms('alkaa'), 'alan alat alkaa alamme alatte alkavat')
  assert.equal(forms('hiihtää'), 'hiihdän hiihdät hiihtää hiihdämme hiihdätte hiihtävät')
  assert.equal(conjugate('nukkua').negativeStem, 'nuku')
})

test('type 2 incl. tehdä / nähdä', () => {
  assert.equal(forms('syödä'), 'syön syöt syö syömme syötte syövät')
  assert.equal(forms('juoda'), 'juon juot juo juomme juotte juovat')
  assert.equal(forms('tehdä'), 'teen teet tekee teemme teette tekevät')
  assert.equal(forms('nähdä'), 'näen näet näkee näemme näette näkevät')
  assert.equal(conjugate('käydä').negativeStem, 'käy')
})

test('type 3 incl. reverse KPT', () => {
  assert.equal(forms('tulla'), 'tulen tulet tulee tulemme tulette tulevat')
  assert.equal(forms('mennä'), 'menen menet menee menemme menette menevät')
  assert.equal(forms('nousta'), 'nousen nouset nousee nousemme nousette nousevat')
  assert.equal(forms('pestä'), 'pesen peset pesee pesemme pesette pesevät')
  assert.equal(forms('opiskella'), 'opiskelen opiskelet opiskelee opiskelemme opiskelette opiskelevat')
  assert.equal(forms('ajatella'), 'ajattelen ajattelet ajattelee ajattelemme ajattelette ajattelevat')
  assert.equal(forms('kuunnella'), 'kuuntelen kuuntelet kuuntelee kuuntelemme kuuntelette kuuntelevat')
  assert.equal(forms('kävellä'), 'kävelen kävelet kävelee kävelemme kävelette kävelevät')
  assert.equal(forms('juosta'), 'juoksen juokset juoksee juoksemme juoksette juoksevat')
  assert.equal(forms('olla'), 'olen olet on olemme olette ovat')
})

test('type 4 incl. reverse KPT', () => {
  assert.equal(forms('haluta'), 'haluan haluat haluaa haluamme haluatte haluavat')
  assert.equal(forms('avata'), 'avaan avaat avaa avaamme avaatte avaavat')
  assert.equal(forms('tavata'), 'tapaan tapaat tapaa tapaamme tapaatte tapaavat')
  assert.equal(forms('pudota'), 'putoan putoat putoaa putoamme putoatte putoavat')
  assert.equal(forms('hypätä'), 'hyppään hyppäät hyppää hyppäämme hyppäätte hyppäävät')
  assert.equal(forms('pakata'), 'pakkaan pakkaat pakkaa pakkaamme pakkaatte pakkaavat')
  assert.equal(forms('tarjota'), 'tarjoan tarjoat tarjoaa tarjoamme tarjoatte tarjoavat')
  assert.equal(forms('maata'), 'makaan makaat makaa makaamme makaatte makaavat')
  assert.equal(conjugate('tavata').negativeStem, 'tapaa')
})

test('types 5 and 6', () => {
  assert.equal(forms('tarvita'), 'tarvitsen tarvitset tarvitsee tarvitsemme tarvitsette tarvitsevat')
  assert.equal(forms('valita'), 'valitsen valitset valitsee valitsemme valitsette valitsevat')
  assert.equal(forms('vanheta'), 'vanhenen vanhenet vanhenee vanhenemme vanhenette vanhenevat')
  assert.equal(forms('lämmetä'), 'lämpenen lämpenet lämpenee lämpenemme lämpenette lämpenevät')
})

test('imperative', () => {
  const imp = (inf: string) => {
    const i = conjugate(inf).imperative
    return [i.sg, i.pl, i.negSg, i.negPl].join(' | ')
  }
  assert.equal(imp('puhua'), 'puhu | puhukaa | älä puhu | älkää puhuko')
  assert.equal(imp('nukkua'), 'nuku | nukkukaa | älä nuku | älkää nukkuko')
  assert.equal(imp('syödä'), 'syö | syökää | älä syö | älkää syökö')
  assert.equal(imp('tehdä'), 'tee | tehkää | älä tee | älkää tehkö')
  assert.equal(imp('tulla'), 'tule | tulkaa | älä tule | älkää tulko')
  assert.equal(imp('mennä'), 'mene | menkää | älä mene | älkää menkö')
  assert.equal(imp('haluta'), 'halua | halutkaa | älä halua | älkää halutko')
  assert.equal(imp('avata'), 'avaa | avatkaa | älä avaa | älkää avatko')
  assert.equal(imp('tarvita'), 'tarvitse | tarvitkaa | älä tarvitse | älkää tarvitko')
  assert.equal(imp('olla'), 'ole | olkaa | älä ole | älkää olko')
})
