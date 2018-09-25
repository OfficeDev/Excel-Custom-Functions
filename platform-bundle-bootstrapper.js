if (global.__platformBundles != undefined) {
  const platformBundles = global.__platformBundles.concat();
  global.__platformBundles = null;
  for (const [index, pb] of platformBundles.entries()) {
    console.log(`PB start ${index + 1}/${platformBundles.length}`);
    eval(pb);
    console.log(`PB done  ${index + 1}/${platformBundles.length}`);
  }
}
