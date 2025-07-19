import dashboardSvg from "./objects/dashboard.svg";
import keySvg from "./objects/key.svg";
import umbrellaSvg from "./objects/umbrella.svg";
import targetSvg from "./objects/target.svg";
import shopSvg from "./objects/shop.svg";
import pencilSvg from "./objects/pencil.svg";
import lockSvg from "./objects/lock.svg";
import martiniSvg from "./objects/martini.svg";
import mapSvg from "./objects/map.svg";
import medalSvg from "./objects/medal.svg";
import rocketSvg from "./objects/rocket.svg";
import tshirtSvg from "./objects/t-shirt.svg";
import walletSvg from "./objects/wallet.svg";
import wrenchSvg from "./objects/wrench.svg";
import trashcanSvg from "./objects/trashcan.svg";
import shortsSvg from "./objects/shorts.svg";
import teaSvg from "./objects/tea.svg";
import shoppingCardSvg from "./objects/shopping-card.svg";
import medKitSvg from "./objects/med-kit.svg";
import magnifyingGlassSvg from "./objects/magnifying-glass.svg";
import wristWatchSvg from "./objects/wrist-watch.svg";
import ringSvg from "./objects/ring.svg";
import slippersSvg from "./objects/slippers.svg";
import headsetSvg from "./objects/headset.svg";
import discountLabelSvg from "./objects/discount-label.svg";
import lampSvg from "./objects/lamp.svg";
import helicopterSvg from "./objects/helicopter.svg";
import car1Svg from "./objects/car-1.svg";
import bikeSvg from "./objects/bike.svg";
import car2Svg from "./objects/car-2.svg";
import minibusSvg from "./objects/minibus.svg";
import sunHatSvg from "./objects/sun-hat.svg";
import trilbySvg from "./objects/trilby.svg";
import redShoeSvg from "./objects/red-shoe.svg";
import basketballSvg from "./objects/basketball.svg";
import skateSvg from "./objects/skate.svg";
import arrestSvg from "./objects/arrest.svg";
import drillSvg from "./objects/drill.svg";
import chemistrySvg from "./objects/chemistry.svg";
import globeMapSvg from "./objects/globe-map.svg";
import certificateSvg from "./objects/certificate.svg";
import drugSvg from "./objects/drug.svg";
import hammerSvg from "./objects/hammer.svg";
import dinnerLoveSvg from "./objects/dinner-love.svg";
import giftHeart2Svg from "./objects/gift-heart-2.svg";
import fileHeartSvg from "./objects/-file-heart.svg";
import redSnazzyShortsSvg from "./objects/red-snazzy-shorts.svg";
import grayTshirtSvg from "./objects/gray-tshirt.svg";
import greenPantsSvg from "./objects/green-pants.svg";
import lightbulbSvg from "./objects/lightbulb.svg";
import calculatorSvg from "./objects/calculator.svg";
import dataTrendsSvg from "./objects/data-trends.svg";
import recordSvg from "./objects/record.svg";
import dataReportSvg from "./objects/data-report.svg";
import alarmClockSvg from "./objects/alarm-clock.svg";
import safeSvg from "./objects/safe.svg";
import creditCardsSvg from "./objects/credit-cards.svg";
import washingMachineSvg from "./objects/washing-machine.svg";
import vacuumCleanerSvg from "./objects/vacuum-cleaner.svg";
import beerSvg from "./objects/beer.svg";
import airConditionerSvg from "./objects/air-conditioner.svg";
import donutSvg from "./objects/donut.svg";
import drumstickSvg from "./objects/drumstick.svg";
import breadSvg from "./objects/bread.svg";
import cheeseSvg from "./objects/cheese.svg";
import hamburgerSvg from "./objects/hamburger.svg";
import hotDogSvg from "./objects/hot-dog.svg";
import pizzaSvg from "./objects/pizza.svg";

export const SVG_ASSETS = {
  dashboard: dashboardSvg,
  key: keySvg,
  umbrella: umbrellaSvg,
  target: targetSvg,
  shop: shopSvg,
  pencil: pencilSvg,
  lock: lockSvg,
  martini: martiniSvg,
  map: mapSvg,
  medal: medalSvg,
  rocket: rocketSvg,
  "t-shirt": tshirtSvg,
  wallet: walletSvg,
  wrench: wrenchSvg,
  trashcan: trashcanSvg,
  shorts: shortsSvg,
  tea: teaSvg,
  "shopping-card": shoppingCardSvg,
  "med-kit": medKitSvg,
  "magnifying-glass": magnifyingGlassSvg,
  "wrist-watch": wristWatchSvg,
  ring: ringSvg,
  slippers: slippersSvg,
  headset: headsetSvg,
  "discount-label": discountLabelSvg,
  lamp: lampSvg,
  helicopter: helicopterSvg,
  "car-1": car1Svg,
  bike: bikeSvg,
  "car-2": car2Svg,
  minibus: minibusSvg,
  "sun-hat": sunHatSvg,
  trilby: trilbySvg,
  "red-shoe": redShoeSvg,
  basketball: basketballSvg,
  skate: skateSvg,
  arrest: arrestSvg,
  drill: drillSvg,
  chemistry: chemistrySvg,
  "globe-map": globeMapSvg,
  certificate: certificateSvg,
  drug: drugSvg,
  hammer: hammerSvg,
  "dinner-love": dinnerLoveSvg,
  "gift-heart-2": giftHeart2Svg,
  "file-heart": fileHeartSvg,
  "red-snazzy-shorts": redSnazzyShortsSvg,
  "gray-tshirt": grayTshirtSvg,
  "green-pants": greenPantsSvg,
  lightbulb: lightbulbSvg,
  calculator: calculatorSvg,
  "data-trends": dataTrendsSvg,
  record: recordSvg,
  "data-report": dataReportSvg,
  "alarm-clock": alarmClockSvg,
  safe: safeSvg,
  "credit-cards": creditCardsSvg,
  "washing-machine": washingMachineSvg,
  "vacuum-cleaner": vacuumCleanerSvg,
  beer: beerSvg,
  "air-conditioner": airConditionerSvg,
  donut: donutSvg,
  drumstick: drumstickSvg,
  bread: breadSvg,
  cheese: cheeseSvg,
  hamburger: hamburgerSvg,
  "hot-dog": hotDogSvg,
  pizza: pizzaSvg,
} as const;

export type SvgAssetKey = keyof typeof SVG_ASSETS;
