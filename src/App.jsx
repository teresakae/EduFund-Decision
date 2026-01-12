import React, { useState, useEffect } from 'react';
import { Info, ChevronRight, CheckCircle, Award, Plus, Trash2, TrendingUp } from 'lucide-react';

const PAPUA_DATASET = {
  "Kab. Nduga": { ruangKelas: 59.56, perpustakaan: 1, listrik: 16.13, komputer: 0 },
  "Kab. Puncak": { ruangKelas: 44.38, perpustakaan: 0, listrik: 52.94, komputer: 2.94 },
  "Kab. Yahukimo": { ruangKelas: 35.38, perpustakaan: 15, listrik: 43.71, komputer: 2.40 },
  "Kab. Pegunungan Bintang": { ruangKelas: 32.09, perpustakaan: 6, listrik: 42.39, komputer: 0 },
  "Kab. Jayawijaya": { ruangKelas: 34.08, perpustakaan: 47, listrik: 20, komputer: 0.8 },
  "Kab. Mamberamo Tengah": { ruangKelas: 45.71, perpustakaan: 5, listrik: 54.29, komputer: 0 },
  "Kab. Yalimo": { ruangKelas: 29.35, perpustakaan: 12, listrik: 8.33, komputer: 0 },
  "Kab. Lanny Jaya": { ruangKelas: 67.14, perpustakaan: 5, listrik: 57.14, komputer: 0 }
};

const EduFundApp = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const [criteria, setCriteria] = useState([
    { name: 'Kondisi Ruang Kelas', type: 'cost', description: 'Persentase ruang kelas rusak berat & sedang', weight: 0 },
    { name: 'Perpustakaan', type: 'benefit', description: 'Jumlah perpustakaan sekolah kondisi baik', weight: 0 },
    { name: 'Akses Listrik', type: 'cost', description: 'Persentase sekolah tanpa akses listrik', weight: 0 },
    { name: 'Akses Komputer', type: 'benefit', description: 'Persentase sekolah dengan akses komputer', weight: 0 }
  ]);
  
  const [alternatives, setAlternatives] = useState([
    { name: 'Kab. Nduga', values: [59.56, 1.0, 16.13, 0.0], isCustom: false },
    { name: 'Kab. Puncak', values: [44.38, 0.0, 52.94, 2.94], isCustom: false },
    { name: 'Kab. Yahukimo', values: [35.38, 15.0, 43.71, 2.40], isCustom: false },
    { name: 'Kab. Pegunungan Bintang', values: [32.09, 6.0, 42.39, 0.0], isCustom: false }
  ]);
  
  const [showKabSelector, setShowKabSelector] = useState(false);
  const [comparisons, setComparisons] = useState({});
  const [results, setResults] = useState(null);

  useEffect(() => {
    const newComparisons = {};
    criteria.forEach((c1, i) => {
      criteria.slice(i + 1).forEach((c2, j) => {
        const key = `${i}-${i + j + 1}`;
        newComparisons[key] = comparisons[key] || 1;
      });
    });
    setComparisons(newComparisons);
  }, [criteria.length]);

  useEffect(() => {
    setAlternatives(prev => prev.map(alt => ({
      ...alt,
      values: alt.values.slice(0, criteria.length).concat(
        Array(Math.max(0, criteria.length - alt.values.length)).fill(0)
      )
    })));
  }, [criteria.length]);

  const availableKabupaten = Object.keys(PAPUA_DATASET).filter(
    kab => !alternatives.some(alt => alt.name === kab)
  );

  const addKabupaten = (kabName) => {
    const data = PAPUA_DATASET[kabName];
    const values = [data.ruangKelas, data.perpustakaan, data.listrik, data.komputer];
    setAlternatives([...alternatives, {
      name: kabName,
      values: values.slice(0, criteria.length).concat(
        Array(Math.max(0, criteria.length - values.length)).fill(0)
      ),
      isCustom: false
    }]);
    setShowKabSelector(false);
  };

  const addCustomKabupaten = () => {
    const customCount = alternatives.filter(a => a.isCustom).length + 1;
    setAlternatives([...alternatives, {
      name: `Kabupaten Custom ${customCount}`,
      values: Array(criteria.length).fill(0),
      isCustom: true
    }]);
  };

  const removeAlternative = (index) => {
    if (alternatives.length > 2) {
      setAlternatives(alternatives.filter((_, i) => i !== index));
    }
  };

  const addCriterion = () => {
    setCriteria([...criteria, {
      name: `Kriteria ${criteria.length + 1}`,
      type: 'benefit',
      description: 'Deskripsi kriteria baru...',
      weight: 0
    }]);
  };

  const removeCriterion = (index) => {
    if (criteria.length > 2) {
      setCriteria(criteria.filter((_, i) => i !== index));
    }
  };

  const steps = [
    { title: 'Kriteria', desc: 'Setup' },
    { title: 'Bobot', desc: 'Bandingkan' },
    { title: 'Data', desc: 'Input' },
    { title: 'Hasil', desc: 'Ranking' }
  ];

  const importanceScale = [
    { value: 5, label: '5', tooltip: 'Mutlak (5x)', group: 'left' },
    { value: 4, label: '4', tooltip: 'Sangat (4x)', group: 'left' },
    { value: 3, label: '3', tooltip: 'Lebih (3x)', group: 'left' },
    { value: 2, label: '2', tooltip: 'Sedikit (2x)', group: 'left' },
    { value: 1, label: '1', tooltip: 'Sama', group: 'center' },
    { value: 1/2, label: '2', tooltip: 'Sedikit (2x)', group: 'right' },
    { value: 1/3, label: '3', tooltip: 'Lebih (3x)', group: 'right' },
    { value: 1/4, label: '4', tooltip: 'Sangat (4x)', group: 'right' },
    { value: 1/5, label: '5', tooltip: 'Mutlak (5x)', group: 'right' }
  ];

  const calculateAHP = () => {
    const n = criteria.length;
    const pcm = Array(n).fill(0).map(() => Array(n).fill(1));
    Object.entries(comparisons).forEach(([key, value]) => {
      const [i, j] = key.split('-').map(Number);
      if (i < n && j < n) {
        pcm[i][j] = value;
        pcm[j][i] = 1 / value;
      }
    });
    const colSums = pcm[0].map((_, j) => pcm.reduce((sum, row) => sum + row[j], 0));
    const normalized = pcm.map(row => row.map((val, j) => val / colSums[j]));
    const weights = normalized.map(row => row.reduce((a, b) => a + b, 0) / n);
    return { weights };
  };

  const calculateTOPSIS = () => {
    const { weights } = calculateAHP();
    const X = alternatives.map(alt => alt.values);
    const normDiv = X[0].map((_, j) => Math.sqrt(X.reduce((sum, row) => sum + row[j] ** 2, 0)));
    const R = X.map(row => row.map((val, j) => val / (normDiv[j] || 1)));
    const V = R.map(row => row.map((val, j) => val * weights[j]));
    const aPlus = criteria.map((c, j) => {
      const col = V.map(row => row[j]);
      return c.type === 'benefit' ? Math.max(...col) : Math.min(...col);
    });
    const aMinus = criteria.map((c, j) => {
      const col = V.map(row => row[j]);
      return c.type === 'benefit' ? Math.min(...col) : Math.max(...col);
    });
    const dPlus = V.map(row => Math.sqrt(row.reduce((sum, val, j) => sum + (val - aPlus[j]) ** 2, 0)));
    const dMinus = V.map(row => Math.sqrt(row.reduce((sum, val, j) => sum + (val - aMinus[j]) ** 2, 0)));
    const scores = dMinus.map((dm, i) => dm / (dPlus[i] + dm));

    const ranked = alternatives.map((alt, i) => ({
      ...alt, score: scores[i]
    })).sort((a, b) => a.score - b.score);
    
    return { ranked, weights };
  };

  const handleCalculate = () => {
    const result = calculateTOPSIS();
    setResults(result);
    setCurrentStep(3);
  };

  const getPriorityColor = (rank) => {
    const colors = [
      'bg-red-100 border-red-300 text-red-900',
      'bg-orange-100 border-orange-300 text-orange-900',
      'bg-yellow-100 border-yellow-300 text-yellow-900',
      'bg-emerald-100 border-emerald-300 text-emerald-900'
    ];
    return colors[rank - 1] || colors[3];
  };

  const getPriorityLabel = (rank) => {
    const labels = [
      'PRIORITAS UTAMA - Sangat Mendesak',
      'PRIORITAS TINGGI',
      'PRIORITAS MENENGAH',
      'PRIORITAS RENDAH'
    ];
    return labels[rank - 1] || 'PRIORITAS RENDAH';
  };

  const getRecommendation = (rank) => {
    if (rank === 1) return 'Daerah ini membutuhkan intervensi dana SEGERA. Kondisi infrastruktur paling mendekati kondisi terburuk (ideal negatif).';
    if (rank === 2) return 'Fokus pada perbaikan bertahap untuk mencegah penurunan kualitas pendidikan lebih lanjut.';
    if (rank === 3) return 'Kondisi infrastruktur cukup stabil, namun tetap memerlukan pemeliharaan rutin pada fasilitas dasar.';
    return 'Kondisi relatif terbaik dibanding kabupaten lain. Fokus pada modernisasi.';
  };

  const InfoBox = ({ title, text }) => (
    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-start gap-3">
      <Info className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
      <div>
        <h4 className="font-bold text-emerald-900 text-sm mb-1">{title}</h4>
        <p className="text-emerald-700 text-sm leading-relaxed">{text}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-800">
      <div className="max-w-5xl mx-auto">
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-100 p-2 rounded-lg"><Award className="w-8 h-8 text-emerald-600" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SPK Alokasi Dana Pendidikan</h1>
              <p className="text-gray-500 text-sm">Provinsi Papua Pegunungan — Metode AHP-TOPSIS</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex justify-between items-center px-4">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${currentStep >= idx ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-gray-100 text-gray-400'}`}>
                   {currentStep > idx ? <CheckCircle className="w-5 h-5" /> : idx + 1}
                </div>
                <p className={`text-xs mt-2 font-semibold uppercase tracking-wider ${currentStep >= idx ? 'text-emerald-600' : 'text-gray-300'}`}>{step.title}</p>
              </div>
            ))}
            <div className="absolute left-0 right-0 top-[45px] h-0.5 bg-gray-100 -z-0 mx-10"></div>
          </div>
        </div>

        {currentStep === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <InfoBox 
              title="Langkah 1: Tentukan Kriteria" 
              text="Pilih kriteria penilaian. Anda dapat mengubah nama dan deskripsi kriteria sesuai dengan dokumen teknis." 
            />
            
            <div className="space-y-4">
              {criteria.map((c, idx) => (
                <div key={idx} className="p-5 border border-gray-200 rounded-xl flex flex-col md:flex-row gap-4 items-start bg-gray-50/50 hover:bg-white hover:shadow-md transition-all duration-300">
                  <div className="font-bold text-emerald-600 bg-emerald-50 w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0">C{idx + 1}</div>
                  
                  <div className="flex-1 w-full space-y-2">
                      <input 
                        value={c.name} 
                        onChange={(e) => {
                          const newC = [...criteria]; newC[idx].name = e.target.value; setCriteria(newC);
                        }}
                        className="w-full font-bold text-lg text-gray-800 bg-transparent border-b border-transparent focus:border-emerald-500 outline-none transition-colors"
                        placeholder="Nama Kriteria"
                      />
                      <input 
                        value={c.description} 
                        onChange={(e) => {
                          const newC = [...criteria]; newC[idx].description = e.target.value; setCriteria(newC);
                        }}
                        className="w-full text-sm text-gray-500 bg-transparent border-b border-gray-200 focus:border-emerald-500 outline-none transition-colors pb-1"
                        placeholder="Deskripsi singkat (contoh: % ruang rusak berat)"
                      />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                    <select 
                      value={c.type}
                      onChange={(e) => {
                          const newC = [...criteria]; newC[idx].type = e.target.value; setCriteria(newC);
                      }}
                      className={`border rounded-lg px-3 py-2 text-sm font-medium outline-none appearance-none cursor-pointer transition-colors ${c.type === 'benefit' ? 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'}`}
                    >
                      <option value="benefit">Benefit (Lebih Tinggi Lebih Baik)</option>
                      <option value="cost">Cost (Lebih Rendah Lebih Baik)</option>
                    </select>
                    {criteria.length > 2 && <button onClick={() => removeCriterion(idx)} className="text-gray-400 hover:text-red-500 p-2 transition-colors"><Trash2 className="w-5 h-5"/></button>}
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={addCriterion} className="mt-6 w-full border-2 border-dashed border-gray-300 text-gray-500 py-3 rounded-xl flex justify-center gap-2 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-medium"><Plus className="w-5 h-5"/> Tambah Kriteria Baru</button>
            <button onClick={() => setCurrentStep(1)} className="mt-8 w-full bg-emerald-600 text-white py-4 rounded-xl font-bold flex justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all">Lanjut ke Pembobotan <ChevronRight/></button>
          </div>
        )}
        
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <InfoBox 
              title="Langkah 2: Bandingkan Kepentingan Kriteria" 
              text="Pilih kriteria mana yang lebih penting. Geser ke KIRI (Hijau) jika kriteria kiri lebih penting, atau ke KANAN (Biru) jika kriteria kanan lebih penting." 
             />

             <div className="space-y-8">
               {criteria.map((c1, i) => criteria.slice(i + 1).map((c2, j) => {
                 const key = `${i}-${i + j + 1}`;
                 const val = comparisons[key] || 1;

                 let feedbackText = "Sama penting";
                 if (val > 1) feedbackText = `"${c1.name}" ${val}x lebih penting`;
                 if (val < 1) feedbackText = `"${c2.name}" ${(1/val).toFixed(0)}x lebih penting`;

                 return (
                   <div key={key} className="p-6 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow bg-gray-50/30">
                     <div className="flex justify-between items-center mb-4">
                        <div className="w-1/3 text-right">
                            <span className="font-bold text-emerald-700 block text-lg">{c1.name}</span>
                            <span className="text-xs text-gray-400 hidden md:block">{c1.description}</span>
                        </div>
                        <div className="bg-white border px-3 py-1 rounded-full text-xs font-bold text-gray-400 shadow-sm mx-4">VS</div>
                        <div className="w-1/3 text-left">
                            <span className="font-bold text-sky-700 block text-lg">{c2.name}</span>
                            <span className="text-xs text-gray-400 hidden md:block">{c2.description}</span>
                        </div>
                     </div>
                     
                     <div className="flex justify-center items-center gap-1 mb-3">
                       {importanceScale.map((s, idx) => {
                         const isSelected = Math.abs(val - s.value) < 0.001;
                         let btnClass = "w-10 h-10 rounded-full font-bold text-sm border-2 transition-all flex flex-col items-center justify-center ";
                         
                         if (s.group === 'left') {
                            btnClass += isSelected ? "bg-emerald-600 border-emerald-600 text-white scale-110 shadow-lg" : "bg-white border-emerald-100 text-emerald-300 hover:border-emerald-400 hover:text-emerald-600";
                         } else if (s.group === 'right') {
                            btnClass += isSelected ? "bg-sky-600 border-sky-600 text-white scale-110 shadow-lg" : "bg-white border-sky-100 text-sky-300 hover:border-sky-400 hover:text-sky-600";
                         } else {
                            btnClass += isSelected ? "bg-gray-600 border-gray-600 text-white scale-110" : "bg-white border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600";
                         }

                         return (
                           <button 
                              key={idx} 
                              onClick={() => setComparisons({...comparisons, [key]: s.value})}
                              className={btnClass}
                              title={s.tooltip}
                           >
                             {s.label}
                           </button>
                         )
                       })}
                     </div>
                     
                     <div className="text-center h-6">
                        <p className={`text-sm font-medium transition-all ${val !== 1 ? 'text-gray-800' : 'text-gray-400'}`}>
                           {val === 1 ? "Kedua kriteria sama pentingnya" : (
                               <span>
                                   <span className={val > 1 ? "text-emerald-600" : "text-sky-600"}>{feedbackText}</span>
                               </span>
                           )}
                        </p>
                     </div>

                   </div>
                 )
               }))}
             </div>
             
             <div className="flex gap-4 mt-8">
                <button onClick={() => setCurrentStep(0)} className="w-1/3 bg-white border border-gray-300 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors">Kembali</button>
                <button onClick={() => setCurrentStep(2)} className="w-2/3 bg-emerald-600 text-white py-4 rounded-xl font-bold flex justify-center gap-2 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 transition-all">Lanjut Input Data <ChevronRight/></button>
             </div>
          </div>
        )}

        {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <InfoBox 
                    title="Langkah 3: Masukkan Data Infrastruktur" 
                    text="Input nilai untuk setiap kriteria pada masing-masing kabupaten. Perhatikan unit pengukuran yang tertera di bawah nama kriteria." 
                />

                <div className="overflow-x-auto mb-6 border border-gray-200 rounded-xl shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                                <th className="p-4 font-bold text-center align-middle min-w-[180px]">Kabupaten</th>
                                {criteria.map((c, i) => (
                                  <th key={i} className="p-4 font-bold text-center align-middle bg-emerald-50/50 text-emerald-900 border-l border-gray-100 min-w-[150px]">
                                    <div className="text-base">{c.name}</div>
                                    <div className="text-[10px] font-normal text-emerald-600 mt-1 uppercase tracking-wide px-2 bg-emerald-100/50 rounded-full inline-block">
                                      {c.description || 'No description'}
                                    </div>
                                  </th>
                                ))}
                                <th className="p-4 w-10 align-middle"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {alternatives.map((alt, i) => (
                                <tr key={i} className="border-b last:border-0 hover:bg-emerald-50/30 transition-colors">
                                    <td className="p-3 align-middle">
                                        <textarea
                                          value={alt.name} 
                                          rows={2}
                                          onChange={e => {const n = [...alternatives]; n[i].name = e.target.value; setAlternatives(n)}} 
                                          className="w-full bg-transparent font-semibold text-gray-700 text-center border-b border-transparent focus:border-emerald-500 outline-none px-2 py-1 resize-none overflow-hidden"
                                        />
                                    </td>
                                    {alt.values.map((v, j) => (
                                        <td key={j} className="p-3 align-middle border-l border-gray-50">
                                            <input type="number" value={v} onChange={e => {const n = [...alternatives]; n[i].values[j] = parseFloat(e.target.value) || 0; setAlternatives(n)}} className="w-full text-center bg-white border border-gray-200 rounded-lg py-2 px-2 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 outline-none transition-all font-mono" />
                                        </td>
                                    ))}
                                    <td className="p-3 text-center align-middle">
                                        {alternatives.length > 2 && <button onClick={() => removeAlternative(i)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                <div className="flex gap-4 mb-8">
                   <div className="relative flex-1">
                      <button onClick={() => setShowKabSelector(!showKabSelector)} disabled={availableKabupaten.length === 0} className="w-full border border-dashed border-emerald-300 text-emerald-600 py-3 rounded-xl flex justify-center gap-2 hover:bg-emerald-50 font-medium transition-colors disabled:opacity-50">
                        <Plus className="w-5 h-5"/> Tambah dari Database
                      </button>
                      {showKabSelector && (
                          <div className="absolute top-full left-0 w-full bg-white shadow-xl border rounded-xl mt-2 z-20 max-h-40 overflow-y-auto">
                              {availableKabupaten.map(k => (
                                  <button key={k} onClick={() => addKabupaten(k)} className="w-full text-left p-3 hover:bg-emerald-50 border-b last:border-0 text-gray-700 text-sm font-medium">{k}</button>
                              ))}
                          </div>
                      )}
                   </div>
                   <button onClick={addCustomKabupaten} className="flex-1 border border-dashed border-sky-300 text-sky-600 py-3 rounded-xl flex justify-center gap-2 hover:bg-sky-50 font-medium transition-colors"><Plus className="w-5 h-5"/> Custom</button>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setCurrentStep(1)} className="w-1/3 bg-white border border-gray-300 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors">Kembali</button>
                    <button onClick={handleCalculate} className="w-2/3 bg-gradient-to-r from-emerald-600 to-sky-600 text-white py-4 rounded-xl font-bold flex justify-center gap-2 hover:shadow-lg hover:shadow-emerald-200 hover:scale-[1.01] transition-all"><TrendingUp className="w-5 h-5"/> Hitung Prioritas</button>
                </div>
            </div>
        )}

        {currentStep === 3 && results && (
            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl mb-6">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-emerald-900 mb-1">Hasil Analisis Selesai!</p>
                      <p className="text-sm text-emerald-700">
                        Sistem telah menghitung ranking prioritas berdasarkan metode AHP-TOPSIS. 
                        Kabupaten dengan skor terendah adalah yang paling membutuhkan bantuan dana.
                      </p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Bobot Kriteria (dari AHP)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {criteria.map((c, idx) => (
                        <div key={idx} className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                          <p className="text-sm text-blue-600 font-medium mb-1">{c.name}</p>
                          <p className="text-2xl font-bold text-blue-900">
                            {(results.weights[idx] * 100).toFixed(1)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-6">🏆 Ranking Prioritas Alokasi Dana</h3>
                  
                  <div className="space-y-4">
                    {results.ranked.map((alt, idx) => {
                      const rank = idx + 1;
                      return (
                        <div
                          key={idx}
                          className={`p-6 rounded-2xl border-2 ${getPriorityColor(rank)} transition-all hover:shadow-lg`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                                rank === 1 ? 'bg-red-600 text-white' :
                                rank === 2 ? 'bg-orange-600 text-white' :
                                rank === 3 ? 'bg-yellow-500 text-white' :
                                'bg-emerald-600 text-white'
                              }`}>
                                #{rank}
                              </div>
                              <div>
                                <h4 className="text-2xl font-bold">{alt.name}</h4>
                                <p className="text-sm font-medium opacity-75">{getPriorityLabel(rank)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium opacity-75">Skor Preferensi</p>
                              <p className="text-3xl font-bold">{alt.score.toFixed(4)}</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t-2 border-current opacity-50">
                            <p className="text-sm leading-relaxed">
                              {getRecommendation(rank)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 p-6 bg-blue-50 rounded-2xl border-2 border-blue-100">
                    <h3 className="text-xl font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <Award className="w-6 h-6" />
                      Kesimpulan Strategis
                    </h3>
                    <p className="text-blue-900 leading-relaxed">
                      Berdasarkan integrasi metode AHP (Pembobotan) dan TOPSIS (Perangkingan), 
                      kabupaten <span className="font-bold text-blue-900">{results.ranked[0].name}</span> ditetapkan 
                      sebagai penerima alokasi dana prioritas pertama. Semakin rendah Skor Preferensi (Ci), 
                      semakin dekat kabupaten tersebut dengan kondisi infrastruktur terburuk, 
                      sehingga membutuhkan intervensi dana bantuan paling mendesak.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentStep(0);
                      setResults(null);
                    }}
                    className="w-full mt-6 bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Mulai Analisis Baru
                  </button>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default EduFundApp;