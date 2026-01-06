import streamlit as st
import pandas as pd
import numpy as np

st.set_page_config(page_title="SPK Alokasi Dana Pendidikan", layout="wide")

st.markdown("""
    <style>
    .stApp { background-color: #0e1117; color: #ffffff; font-family: 'Segoe UI', sans-serif; }
    .header-card { background-color: #1a1c24; padding: 2.5rem; border-radius: 1rem; border-left: 5px solid #6366f1; margin-bottom: 2rem; }
    .ranking-card { border-radius: 10px; padding: 20px; margin-bottom: 15px; border: 1px solid #333; }
    .priority-1 { background-color: #450a0a; border-color: #991b1b; color: #fecaca; }
    .priority-2 { background-color: #431407; border-color: #9a3412; color: #fed7aa; }
    .priority-3 { background-color: #451a03; border-color: #92400e; color: #fef3c7; }
    .priority-4 { background-color: #064e3b; border-color: #065f46; color: #d1fae5; }
    div[data-testid="stTable"] table { background-color: #1a1c24; color: white; border-radius: 0.5rem; width: 100%; border: 1px solid #334155; }
    th { background-color: #1e293b !important; color: #94a3b8 !important; text-align: center !important; }
    .step-guide { background-color: #1e293b; padding: 15px; border-radius: 8px; border: 1px solid #334155; margin-bottom: 20px; }
    .element-container:has(#stHeader) a, .stMarkdown a, h1 a, h2 a, h3 a, h4 a, h5 a, h6 a { display: none !important; }
    </style>
""", unsafe_allow_html=True)

st.markdown("""
    <div class="header-card">
        <h1 style='color: #ffffff; margin-bottom: 0px;'>Sistem Pendukung Keputusan Alokasi Dana Pendidikan</h1>
        <p style='color: #9ca3af; font-size: 1.1rem;'>Provinsi Papua Pegunungan — Metode AHP-TOPSIS</p>
    </div>
""", unsafe_allow_html=True)

st.sidebar.header("⚙️ Konfigurasi Data")
n_crit = st.sidebar.number_input("Jumlah Kriteria", 1, 10, 4)
n_alt = st.sidebar.number_input("Jumlah Alternatif", 1, 50, 4)

default_names = ["C1: Ruang Kelas", "C2: Perpustakaan", "C3: Akses Listrik", "C4: Akses Komputer"]
default_types = ["cost", "benefit", "cost", "benefit"]
default_vals = [[59.56, 1.0, 16.13, 0.0], [44.38, 0.0, 52.94, 2.94], [35.38, 15.0, 43.71, 2.40], [32.09, 6.0, 42.39, 0.0]]
default_alts = ["Kab. Nduga", "Kab. Puncak", "Kab. Yahukimo", "Kab. Pegunungan Bintang"]

tabs = st.tabs(["📄 Data Input", "📊 Tahap I: Hitung AHP", "🧮 Tahap II: Hasil TOPSIS"])

with tabs[0]:
    st.markdown("""
        <div class="step-guide">
            <h3 style="margin-top:0">👣 Langkah 1: Masukkan Data Lapangan</h3>
            <p>Pada tahap ini, Anda perlu menentukan <b>Nama Kriteria</b> (apa yang dinilai) dan <b>Nilai Alternatif</b> (data setiap kabupaten). 
            Gunakan mode default untuk simulasi data Papua Pegunungan TA 2022/2023.</p>
        </div>
    """, unsafe_allow_html=True)
    
    st.subheader("1. Pengaturan Kriteria")
    c_names, c_types = [], []
    cols_k = st.columns([3, 1])
    for j in range(n_crit):
        dn = default_names[j] if j < 4 else f"Kriteria {j+1}"
        dt = default_types[j] if j < 4 else "benefit"
        c_names.append(cols_k[0].text_input(f"Nama Kriteria {j+1}", dn, key=f"cn{j}"))
        c_types.append(cols_k[1].selectbox(f"Tipe {j+1}", ["benefit", "cost"], 0 if dt=="benefit" else 1, key=f"ct{j}"))

    st.markdown("---")
    st.subheader("2. Masukkan Nilai Alternatif")
    alt_names, matrix = [], []
    h_cols = st.columns([2] + [1] * n_crit)
    h_cols[0].markdown("**Kabupaten**")
    for j in range(n_crit): h_cols[j+1].markdown(f"**{c_names[j]}**")

    for i in range(n_alt):
        row = st.columns([2] + [1] * n_crit)
        da = default_alts[i] if i < 4 else f"Kab. {i+1}"
        alt_names.append(row[0].text_input(f"Kab {i}", da, key=f"an{i}", label_visibility="collapsed"))
        row_vals = []
        for j in range(n_crit):
            dv = default_vals[i][j] if (i < 4 and j < 4) else 0.0
            row_vals.append(row[j+1].number_input(f"v{i}{j}", value=dv, label_visibility="collapsed", key=f"v{i}{j}"))
        matrix.append(row_vals)
    st.success("💡 Tip: Jika sudah selesai mengisi, silakan pindah ke Tab **'Tahap I: Hitung AHP'**.")
    
with tabs[1]:
    st.markdown("""
        <div class="step-guide">
            <h3 style="margin-top:0">👣 Langkah 2: Tentukan Tingkat Kepentingan</h3>
            <p>Metode AHP digunakan untuk menentukan <b>seberapa penting</b> suatu kriteria dibandingkan yang lain. 
            Contoh: Jika Ruang Kelas dianggap lebih mendesak daripada Perpustakaan, berikan nilai 3 atau lebih.</p>
        </div>
    """, unsafe_allow_html=True)
    
    st.header("TAHAP I: Analytic Hierarchy Process (AHP)")
    st.info("Nilai 1: Sama Penting | Nilai 3: Sedikit Lebih Penting | Nilai 5: Lebih Penting")
    
    pcm = np.ones((n_crit, n_crit))
    pcm_defaults = {(0,1): 3.0, (0,2): 1.0, (0,3): 2.0, (1,2): 0.333, (1,3): 0.5, (2,3): 2.0}
    for i in range(n_crit):
        for j in range(i + 1, n_crit):
            dv = pcm_defaults.get((i,j), 1.0)
            val = st.number_input(f"Seberapa penting {c_names[i]} vs {c_names[j]}?", 0.11, 9.0, dv, step=0.1, key=f"pcm_{i}_{j}")
            pcm[i, j] = val
            pcm[j, i] = 1 / val

    st.subheader("1. Pairwise Comparison Matrix (PCM)")
    df_pcm = pd.DataFrame(pcm, index=c_names, columns=c_names)
    df_pcm.loc['Jumlah'] = pcm.sum(axis=0)
    st.table(df_pcm.round(3))

    st.subheader("2. Normalisasi Matriks & Perhitungan Bobot (w)")
    col_sums = pcm.sum(axis=0)
    norm_pcm = pcm / col_sums
    weights = norm_pcm.mean(axis=1)
    df_norm = pd.DataFrame(norm_pcm, index=c_names, columns=c_names)
    df_norm['Jumlah Baris'] = norm_pcm.sum(axis=1)
    df_norm['Bobot (w)'] = weights
    st.table(df_norm.round(3))

    st.subheader("3. Uji Konsistensi (Consistency Ratio)")
    wsv = np.dot(pcm, weights)
    lambda_max = np.mean(wsv / weights)
    ci = (lambda_max - n_crit) / (n_crit - 1) if n_crit > 1 else 0
    ri_dict = {1:0, 2:0, 3:0.58, 4:0.9, 5:1.12, 6:1.24, 7:1.32, 8:1.41, 9:1.45, 10:1.49}
    cr = ci / ri_dict[n_crit] if n_crit in ri_dict and ri_dict[n_crit] > 0 else 0
    c1, c2, c3 = st.columns(3)
    c1.metric("λ max", round(lambda_max, 3))
    c2.metric("Consistency Index (CI)", round(ci, 4))
    c3.metric("Consistency Ratio (CR)", f"{round(cr*100, 2)}%")
    if cr < 0.10:
        st.success("✅ CR < 10%: Matriks perbandingan KONSISTEN dan dapat diterima.")
    else:
        st.error("❌ CR >= 10%: Matriks tidak konsisten!")
    
    st.markdown("---")
    calculate = st.button("🚀 Jalankan Kalkulasi Final TOPSIS", use_container_width=True)

with tabs[2]:
    if not calculate:
        st.info("👋 Silakan tekan tombol **'Jalankan Kalkulasi Final'** di Tab sebelumnya untuk melihat hasil.")
    else:
        st.markdown("""
            <div class="step-guide">
                <h3 style="margin-top:0">👣 Langkah 3: Hasil Analisis & Rekomendasi</h3>
                <p>Sistem telah menghitung jarak setiap kabupaten terhadap kondisi ideal. 
                Kabupaten dengan <b>Skor Preferensi (Ci) terendah</b> adalah daerah yang paling mendesak untuk dibantu.</p>
            </div>
        """, unsafe_allow_html=True)
        
        X = np.array(matrix)
        norm_div = np.sqrt(np.sum(X**2, axis=0))
        R = X / np.where(norm_div == 0, 1, norm_div)
        V = R * weights
        
        a_plus, a_minus = [], []
        for j in range(n_crit):
            if c_types[j] == "benefit":
                a_plus.append(np.max(V[:, j])); a_minus.append(np.min(V[:, j]))
            else:
                a_plus.append(np.min(V[:, j])); a_minus.append(np.max(V[:, j]))

        d_p = np.sqrt(np.sum((V - a_plus)**2, axis=1))
        d_m = np.sqrt(np.sum((V - a_minus)**2, axis=1))
        ci_scores = d_m / (d_p + d_p + 1e-10) 
        ci_scores = d_m / (d_p + d_m)

        with st.expander("🔍 Detail Tahapan Matriks"):
            st.write("**1. Matriks Keputusan (X)**")
            st.dataframe(pd.DataFrame(X, index=alt_names, columns=c_names))
            st.write("**2. Matriks Ternormalisasi (R)**")
            st.dataframe(pd.DataFrame(R, index=alt_names, columns=c_names).style.format("{:.4f}"))
            st.write("**3. Matriks Ternormalisasi Terbobot (V)**")
            st.dataframe(pd.DataFrame(V, index=alt_names, columns=c_names).style.format("{:.4f}"))
            st.write("**4. Solusi Ideal Positif (A⁺) & Negatif (A⁻)**")
            st.table(pd.DataFrame([a_plus, a_minus], index=["A⁺", "A⁻"], columns=c_names).style.format("{:.4f}"))
            st.write("**5. Jarak ke Solusi Ideal**")
            st.table(pd.DataFrame({"D⁺": d_p, "D⁻": d_m, "Preferensi (Ci)": ci_scores}, index=alt_names).style.format("{:.4f}"))

        st.header("Hasil Perhitungan TOPSIS - Ranking Prioritas")
        res_df = pd.DataFrame({"Kabupaten": alt_names, "Ci": ci_scores, "Raw": list(X)}).sort_values("Ci", ascending=True)
        res_df["Ranking"] = range(1, len(res_df) + 1)

        status_labels = {1: "PRIORITAS UTAMA (Sangat Urgent)", 2: "PRIORITAS TINGGI", 3: "PRIORITAS MENENGAH", 4: "PRIORITAS RENDAH"}

        for _, r in res_df.iterrows():
            rank = r['Ranking']
            p_class = f"priority-{rank}" if rank <= 4 else "priority-4"
            status = status_labels.get(rank, "Prioritas Tambahan")
            
            raw_vals = r['Raw']
            masalah_utama = []
            for i in range(len(c_types)):
                avg = np.mean(X[:, i])
                if (c_types[i] == "cost" and raw_vals[i] > avg) or (c_types[i] == "benefit" and raw_vals[i] < avg):
                    masalah_utama.append(c_names[i])
            
            rekomendasi = ""
            if rank == 1:
                rekomendasi = f"Daerah ini membutuhkan intervensi dana segera untuk sektor kritis: {', '.join(masalah_utama[:2])}. Kondisi infrastruktur paling mendekati solusi ideal negatif."
            elif rank == 2:
                rekomendasi = f"Fokus pada perbaikan bertahap khususnya pada sektor {', '.join(masalah_utama[:1])} untuk mencegah penurunan kualitas pendidikan lebih lanjut."
            elif rank == 3:
                rekomendasi = "Kondisi infrastruktur cukup stabil, namun tetap memerlukan pemeliharaan rutin pada fasilitas dasar."
            else:
                rekomendasi = "Kondisi relatif terbaik dibanding kabupaten lain. Dana dapat difokuskan pada pengembangan teknologi (modernisasi) dan pemeliharaan."

            st.markdown(f"""
                <div class="ranking-card {p_class}">
                    <div style="display: flex; justify-content: space-between;">
                        <b>RANKING #{rank}</b> <span>Skor Ci: <b>{r['Ci']:.4f}</b></span>
                    </div>
                    <h3 style="margin: 10px 0;">{r['Kabupaten']}</h3>
                    <p style="margin-bottom: 5px;"><b>Status:</b> {status}</p>
                    <p style="font-size: 0.9rem;">{rekomendasi}</p>
                </div>
            """, unsafe_allow_html=True)

        st.markdown(f"""
            <div style="background-color: #1e293b; padding: 25px; border-radius: 10px; border: 1px solid #6366f1; margin-top: 30px;">
                <h3 style="color: #6366f1; margin: 0;">✅ Kesimpulan Strategis</h3>
                <p style="margin-bottom: 10px;">Berdasarkan integrasi metode AHP (Pembobotan) dan TOPSIS (Perangkingan), kabupaten <b>{res_df.iloc[0]['Kabupaten']}</b> ditetapkan sebagai penerima alokasi dana prioritas pertama.</p>
                <p style="font-size: 0.85rem; color: #9ca3af; line-height: 1.5;">Analisis ini didasarkan pada disparitas data fisik sekolah TA 2022/2023. Semakin rendah Skor Ci, semakin dekat kabupaten tersebut dengan kondisi infrastruktur terburuk (ideal negatif), sehingga membutuhkan intervensi dana bantuan paling mendesak.</p>
            </div>
        """, unsafe_allow_html=True)

st.markdown('<div style="text-align: center; color: #6b7280; font-size: 0.8rem; margin-top: 40px;">© 2026 - SPK Alokasi Dana Pendidikan Papua Pegunungan</div>', unsafe_allow_html=True)
