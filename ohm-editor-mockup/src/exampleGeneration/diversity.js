//an implementation of pq distance as shown in
//  Augsten, Nikolaus, Michael Bohlen, and Johann Gamper. "Approximate Tree Matching with pq-Grams."
function distance_pq(a, b, label = "label", p=2, q=3){
  //sets of pq labels
  let profilea = pq_profile(a, p, q, label),
      profileb = pq_profile(b, p, q, label);

  let intersectionSize = 0;
  seen = [];
  profilea.forEach(ai=>{
    if(profileb.find((bi)=> pq_equal(bi,ai)) &&
       !seen.find((i)=>pq_equal(ai, i))
      ){
      let freqa = profilea.filter(i=> pq_equal(i, ai)).length;
      let freqb = profileb.filter(i=> pq_equal(i, ai)).length;
      intersectionSize += Math.min(freqa, freqb);
      seen.push(ai);
    }
  });

  let unionSize = profilea.length + profileb.length;

  return 1 - 2*(intersectionSize / unionSize);
}

//mean square distance
function diversity(example, set, label = "label", distance = distance_pq){
  let diversity = 0;
  set.forEach((item)=>{
    diversity += Math.pow(distance(item, example, label), 2);
  });
  diversity /= set.length;

  return diversity;
}

function entropy(set, label = "label"){
  let buckets = {};

  set.forEach((item)=>{
    if(!buckets.hasOwnProperty(item[label])){
      buckets[item[label]] = 0;
    }
    buckets[item[label]]++;
  });

  let sum = Object.keys(buckets).reduce((agg, key)=> agg + buckets[key], 0);

  let proportions = Object.keys(buckets).map((key)=> buckets[key]/sum);
  console.log(proportions);
  return -proportions.map((p)=> p * Math.log(p)).reduce((a,b)=> a+b, 0);
}

if(typeof module !== "undefined" && typeof module.exports !== "undefined"){
  module.exports = {
    distance_pq,
    diversity,
    entropy
  };
} else {
  window.distance_pq = distance_pq;
  window.diversity = diversity;
  window.entropy = entropy;
}




//PQ DISTANCE HELPERS

function pq_profile(root, p, q, label){
  let profile = [];
  let ancestors = makeArray(p);
  profile = profile_helper(root, p, q, profile, ancestors, label);
  return profile;
}

function profile_helper(/*tree,*/ node, p, q, profile, ancestors, label){
  ancestors = pq_shift(ancestors, node[label]);
  let siblings = makeArray(q);

  if(node.children && node.children.length > 0){
    node.children.forEach((child)=>{
      siblings = pq_shift(siblings, child[label]);
      profile = profile.concat([ancestors.concat(siblings)]);
      profile = profile_helper(child, p, q, profile, ancestors, label);
    })
  } else { //LEAF
    profile = profile.concat([ancestors.concat(siblings)]);
  }

  return profile;
}

function pq_shift(array, item){
  array.shift();
  array.push(item);
  return array;
}

function makeArray(length){
  var array = [];
  for(let i=0; i<length; i++, array.push(null));
  return array;
}

function pq_equal(tuplea, tupleb){
  return tuplea.map((la,i)=> la === tupleb[i]).reduce((a,b)=> a && b, true);
}
