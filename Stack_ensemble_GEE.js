var Scale_Map = 30;

/// temporalCollection2021_L8: is the image of L8 time series for 2021
/// temporalCollection2021_S2: is the image of S2 time series for 2021
// ////////////////////////////////////////////////////////////////////////////////////////
var temporalCollection2021 = temporalCollection2021_L8.addBands(temporalCollection2021_S2);
// ////////////////////////////////////////////////////////////////////////////////////////
var new_FC2021 = Other2021.merge(Double_crop2021).merge(Alfalfa2021).merge(Single_SpringCrop2021).merge(Single_FallCrop2021);
///////////////////////////////////////////////////////////////////////////////
var satellite2021 = temporalCollection2021;
var bandnames2021 = satellite2021.bandNames();
var training2021 = satellite2021.sampleRegions({
collection:new_FC2021,
properties: ['classvalue'],
scale: Scale_Map,
tileScale:16,
geometries:true
});
//////////////////////////////////////////////////////////////////////////////
//divide training dataset into two Random cluster (70% and 30%)
var withRandom2021 = training2021.randomColumn(withRandom2021,50);

// use 70% as training dataset
var trainingSet2021 = withRandom2021.filter(ee.Filter.lt('random',0.7));

// use 30% of data as the test set
var testingSet2021 = withRandom2021.filter(ee.Filter.gt('random',0.7));
//////////////////////////////////////////////////////////////////////////////
//Classifier

//// *** Note: Users must first find the optimal hyperparameters of each ML model
//// The hyperparameters are described in the paper. 

var classifier_RF = ee.Classifier.smileRandomForest().setOutputMode('MULTIPROBABILITY');
var classifier_SVM = ee.Classifier.libsvm().setOutputMode('MULTIPROBABILITY');
var classifier_Cart = ee.Classifier.smileCart().setOutputMode('MULTIPROBABILITY');
var classifier_GTB = ee.Classifier.smileGradientTreeBoost().setOutputMode('MULTIPROBABILITY');
var classifier_MD = ee.Classifier.minimumDistance();
//////////////////////////////////////////////////////////////////////////////
var trained2021_RF = classifier_RF.train(testingSet2021, 'classvalue', bandnames2021);
var trained2021_SVM = classifier_SVM.train(testingSet2021, 'classvalue', bandnames2021);
var trained2021_Cart = classifier_Cart.train(testingSet2021, 'classvalue', bandnames2021);
var trained2021_GTB = classifier_GTB.train(testingSet2021, 'classvalue', bandnames2021);
////////////////////////////////////////////////////////////////////////////////
//2021
var classified2021_RF = satellite2021.classify(trained2021_RF);
var classified2021_SVM = satellite2021.classify(trained2021_SVM);
var classified2021_Cart = satellite2021.classify(trained2021_Cart);
var classified2021_GTB = satellite2021.classify(trained2021_GTB);

var classified2021_RF_C0 = classified2021_RF.arrayGet(0);
var classified2021_RF_C1 = classified2021_RF.arrayGet(1);
var classified2021_RF_C2 = classified2021_RF.arrayGet(2);
var classified2021_RF_C3 = classified2021_RF.arrayGet(3);
var classified2021_RF_C4 = classified2021_RF.arrayGet(4);
var classified2021_SVM_C0 = classified2021_SVM.arrayGet(0);
var classified2021_SVM_C1 = classified2021_SVM.arrayGet(1);
var classified2021_SVM_C2 = classified2021_SVM.arrayGet(2);
var classified2021_SVM_C3 = classified2021_SVM.arrayGet(3);
var classified2021_SVM_C4 = classified2021_SVM.arrayGet(4);
var classified2021_Cart_C0 = classified2021_Cart.arrayGet(0);
var classified2021_Cart_C1 = classified2021_Cart.arrayGet(1);
var classified2021_Cart_C2 = classified2021_Cart.arrayGet(2);
var classified2021_Cart_C3 = classified2021_Cart.arrayGet(3);
var classified2021_Cart_C4 = classified2021_Cart.arrayGet(4);
var classified2021_GTB_C0 = classified2021_GTB.arrayGet(0);
var classified2021_GTB_C1 = classified2021_GTB.arrayGet(1);
var classified2021_GTB_C2 = classified2021_GTB.arrayGet(2);
var classified2021_GTB_C3 = classified2021_GTB.arrayGet(3);
var classified2021_GTB_C4 = classified2021_GTB.arrayGet(4);
var classified2021 = classified2021_RF_C0.addBands(classified2021_RF_C1).addBands(classified2021_RF_C2).addBands(classified2021_RF_C3).addBands(classified2021_RF_C4)
        .addBands(classified2021_SVM_C0).addBands(classified2021_SVM_C1).addBands(classified2021_SVM_C2).addBands(classified2021_SVM_C3).addBands(classified2021_SVM_C4)
        .addBands(classified2021_Cart_C0).addBands(classified2021_Cart_C1).addBands(classified2021_Cart_C2).addBands(classified2021_Cart_C3).addBands(classified2021_Cart_C4)
        .addBands(classified2021_GTB_C0).addBands(classified2021_GTB_C1).addBands(classified2021_GTB_C2).addBands(classified2021_GTB_C3).addBands(classified2021_GTB_C4);
///////////////////////////////////////////////////////////////////////////////////
var bandnames_MD2021 = classified2021.bandNames();
var training_MD2021 = classified2021.sampleRegions({
collection:new_FC2021,
properties: ['classvalue'],
scale: Scale_Map,
tileScale:16,
geometries:true
});
/////////////////////////////////////////////////////////////////////////////
var trained2021_MD = classifier_MD.train(training_MD2021, 'classvalue', bandnames_MD2021);
var classified2021_MD = classified2021.classify(trained2021_MD);
Map.addLayer(classified2021_MD, IVP, 'classified2021_MD');
//////////////////////////////////////////////////////////////////////
var testing_MD2021 = classified2021_MD.sampleRegions({
collection:testingSet2021,
properties: ['classvalue'],
scale: Scale_Map,
tileScale:16,
geometries:true
});
////////////////////////////////////////////////////////////////////////////////////////////
var confusionMatrix2021 = testing_MD2021.errorMatrix('classvalue', 'classification');
print("Overall accuracy2021", confusionMatrix2021.accuracy());
print("Consumer's accuracy2021", confusionMatrix2021.consumersAccuracy());
print("Producer's accuracy2021", confusionMatrix2021.producersAccuracy());
print('Kappa statistic2021', confusionMatrix2021.kappa());