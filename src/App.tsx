import React, { useState, useRef } from 'react';
import { useDegreeStatus } from './useDegreeStatus';
import { FiUpload, FiFileText, FiBook } from 'react-icons/fi';
import { FaGraduationCap, FaFlask, FaNetworkWired } from 'react-icons/fa';

const OVERALL_CREDITS_REQUIRED = 120;

// Get progress color: Green 100%, Blue 75-99%, Yellow 50-74%, Red <50%
function getProgressColor(pct: number): string {
    if (pct >= 100) return '#10b981';
    if (pct >= 75) return '#2F4AAC';
    if (pct >= 50) return '#E6BD39';
    return '#E63939';
}

// Map requirement names to icons
function getRequirementIcon(name: string): React.ReactNode {
    const n = name.toLowerCase();
    if (n.includes('science') && n.includes('breadth')) return <FaNetworkWired size={20} />;
    if (n.includes('science')) return <FaFlask size={20} />;
    if (n.includes('arts')) return <FiBook size={20} />;
    if (n.includes('communication')) return <FiFileText size={20} />;
    return <FaGraduationCap size={20} />;
}

type CourseTab = 'all' | 'done' | 'current' | 'todo';

function App() {
    const { creditStore, listStore, updateDashboard } = useDegreeStatus();
    const [isUploading, setIsUploading] = useState(false);
    const [courseTab, setCourseTab] = useState<CourseTab>('all');
    const [overallCreditsEarned, setOverallCreditsEarned] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const overallProgressPct = Math.round((overallCreditsEarned / OVERALL_CREDITS_REQUIRED) * 100);
    const overallCreditsRemaining = OVERALL_CREDITS_REQUIRED - overallCreditsEarned;

    const completedList = listStore["complete"]?.missing || listStore["completed"]?.missing || [];
    const inProgressList = listStore["inprogress"]?.missing || listStore["in-progress"]?.missing || [];
    const stillNeedingList = listStore["missing"]?.missing || listStore["still-needing"]?.missing || [];

    const allCourses = [...completedList, ...inProgressList, ...stillNeedingList];
    const filteredCourses =
        courseTab === 'all' ? allCourses :
        courseTab === 'done' ? completedList :
        courseTab === 'current' ? inProgressList :
        stillNeedingList;

    const allKeys = Object.keys(creditStore).filter(Boolean);
    const requirements = allKeys.filter(key => key !== "Total Credits");

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                updateDashboard(result);
                setOverallCreditsEarned(84);
                alert("Transcript parsed! Data updated.");
            } else {
                const err = await response.json().catch(() => ({}));
                alert("Server error: " + (err.error || response.statusText));
            }
        } catch (error) {
            console.error("Connection to Python backend failed:", error);
            alert("Could not connect to the Python backend. Is Flask running?");
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) uploadFile(file);
        event.target.value = '';
    };

    return (
        <div style={styles.page}>
            {/* Header */}
            <header style={styles.header}>
                <div style={styles.headerLeft}>
                    <FaGraduationCap size={32} color="white" style={{ flexShrink: 0 }} />
                    <div>
                        <h1 style={styles.headerTitle}>UBC On Track</h1>
                        <p style={styles.headerTagline}>Track your degree requirements and stay on course</p>
                    </div>
                </div>
            </header>

            {/* 3-Column Layout */}
            <div style={styles.columns}>
                {/* Left Column */}
                <div style={styles.leftCol}>
                    {/* Upload Transcript */}
                    <div style={styles.uploadCard}>
                        <h3 style={styles.uploadTitle}>
                            <FiFileText size={18} style={{ marginRight: 8 }} />
                            Upload Transcript
                        </h3>
                        <div
                            style={styles.dropZone}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#2F4AAC'; }}
                            onDragLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.style.borderColor = '#cbd5e1';
                                const file = e.dataTransfer.files[0];
                                if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
                                    uploadFile(file);
                                }
                            }}
                        >
                            <FiUpload size={40} color="#94a3b8" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: 8, display: 'block',}} />
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                                accept=".xlsx,.xls,.csv"
                            />
                            <button
                                type="button"
                                style={styles.chooseFileBtn}
                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                disabled={isUploading}
                            >
                                {isUploading ? 'Processing...' : 'Choose File'}
                            </button>
                            <p style={styles.uploadHint}>Excel (.xlsx, .xls) or CSV files</p>
                        </div>
                    </div>

                    {/* Overall Progress - Dark Blue Card */}
                    <div style={styles.overallCard}>
                        <h3 style={styles.overallTitle}>Overall Progress</h3>
                        <div style={styles.overallRingWrapper}>
                            <div
                                style={{
                                    ...styles.overallRing,
                                    background: `conic-gradient(#E6BD39 0% ${overallProgressPct}%, rgba(255,255,255,0.2) ${overallProgressPct}% 100%)`,
                                }}
                            />
                            <div style={styles.overallRingInner}>
                                <span style={styles.overallPctText}>{overallProgressPct}%</span>
                            </div>
                        </div>
                        <div style={styles.overallCredits}>
                            <span style={styles.overallCreditsNum}>{overallCreditsEarned} / {OVERALL_CREDITS_REQUIRED}</span>
                            <span style={styles.overallCreditsLabel}>Credits Completed</span>
                        </div>
                        <hr style={styles.overallHr} />
                        <p style={styles.overallRemaining}>{overallCreditsRemaining} credits remaining to graduate</p>
                    </div>
                </div>

                {/* Middle Column - Requirement Categories */}
                <div style={styles.middleCol}>
                    <h2 style={styles.sectionTitle}>Requirement Categories</h2>
                    <div style={styles.reqGrid}>
                        {requirements
                            .filter(name => {
                                const d = creditStore[name];
                                return d && typeof d.required === 'number' && d.required > 0;
                            })
                            .map(name => {
                                const data = creditStore[name];
                                const required = data.required || 1;
                                const completed = data.completed || 0;
                                const inProgress = data.inProgress || 0;
                                const donePct = required > 0 ? (completed / required) * 100 : 0;
                                const ipPct = required > 0 ? (inProgress / required) * 100 : 0;
                                const effective = Math.min(completed + inProgress, required);
                                const pct = required > 0 ? Math.round((completed / required) * 100) : 0;
                                const color = getProgressColor(pct);
                                const remaining = Math.max(0, required - completed - inProgress);
                                const ringGradient = inProgress > 0
                                    ? `conic-gradient(#10b981 0% ${donePct}%, #E6BD39 ${donePct}% ${donePct + ipPct}%, #e2e8f0 ${donePct + ipPct}% 100%)`
                                    : `conic-gradient(${color} 0% ${pct}%, #e2e8f0 ${pct}% 100%)`;
                                return (
                                    <div key={name} style={styles.reqCard}>
                                        <div style={styles.reqCardHeader}>
                                            <span style={{ ...styles.reqIcon, color }}>{getRequirementIcon(name)}</span>
                                            <span style={styles.reqName}>{name}</span>
                                        </div>
                                        <div style={styles.reqRingWrapper}>
                                            <div
                                                style={{
                                                    ...styles.reqRing,
                                                    background: ringGradient,
                                                }}
                                            />
                                            <div style={styles.reqRingInner}>
                                                 <span style={styles.reqPctText}>{pct}%</span>
                                            </div>
                                        </div>
                                        <div style={styles.reqStats}>
                                            <span style={styles.reqCredits}>{completed}/{required} credits</span>
                                            {inProgress > 0 && (
                                                <span style={styles.reqInProgress}>+{inProgress} in progress</span>
                                            )}
                                            <span style={styles.reqRemaining}>{remaining} credits remaining</span>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                    {/* Color Legend */}
                    <div style={styles.legend}>
                        <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#10b981' }} />100%</span>
                        <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#2F4AAC' }} />75–99%</span>
                        <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#E6BD39' }} />50–74%</span>
                        <span style={styles.legendItem}><span style={{ ...styles.legendDot, background: '#E63939' }} />&lt;50%</span>
                    </div>
                </div>

                {/* Right Column - Course List */}
                <div style={styles.rightCol}>
                    <h2 style={styles.sectionTitle}>Course List</h2>
                    <div style={styles.tabsWrapper}>
                        <div style={styles.tabs}>
                            {(['all', 'done', 'current', 'todo'] as const).map(tab => (
                            <button
                                key={tab}
                                style={{
                                    ...styles.tab,
                                    ...(courseTab === tab ? styles.tabActive : {}),
                                }}
                                onClick={() => setCourseTab(tab)}
                            >
                                {tab === 'all' && `All(${allCourses.length})`}
                                {tab === 'done' && `Done(${completedList.length})`}
                                {tab === 'current' && `Current(${inProgressList.length})`}
                                {tab === 'todo' && `Todo(${stillNeedingList.length})`}
                            </button>
                            ))}
                        </div>
                    </div>
                    <div style={styles.courseList}>
                        {filteredCourses.length === 0 ? (
                            <p style={styles.courseEmpty}>No courses in this category</p>
                        ) : (
                            filteredCourses.map((course, idx) => {
                                const status = completedList.includes(course) ? 'complete' :
                                    inProgressList.includes(course) ? 'current' : 'todo';
                                return (
                                    <div key={idx} style={styles.courseRow}>
                                        <div style={styles.courseInfo}>
                                            <span style={styles.courseCode} title={course}>{course}</span>
                                        </div>
                                        <span
                                            style={{
                                                ...styles.courseBadge,
                                                ...(status === 'complete' ? styles.badgeComplete :
                                                    status === 'current' ? styles.badgeCurrent : styles.badgeTodo),
                                            }}
                                            title={status === 'complete' ? 'Complete' : status === 'current' ? 'Current' : 'Todo'}
                                        >
                                            {status === 'complete' ? '✓' : status === 'current' ? '●' : '○'}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    },
    header: {
        background: 'linear-gradient(135deg, #000B72 0%, #2F4AAC 100%)',
        padding: '24px 32px',
        marginBottom: 24,
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
    },
    headerTitle: {
        margin: 0,
        color: 'white',
        fontSize: '1.5rem',
        fontWeight: 700,
    },
    headerTagline: {
        margin: '4px 0 0 0',
        color: 'rgba(255,255,255,0.9)',
        fontSize: '0.9rem',
    },
    columns: {
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 320px) minmax(400px, 1fr) minmax(260px, 300px)',
        gap: 24,
        padding: '0 32px 32px',
        maxWidth: 1600,
        margin: '0 auto',
    },
    leftCol: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
    },
    uploadCard: {
        background: 'white',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    uploadTitle: {
        margin: '0 0 16px 0',
        fontSize: '1rem',
        fontWeight: 600,
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
    },
    dropZone: {
        border: '2px dashed #cbd5e1',
        borderRadius: 8,
        padding: 24,
        textAlign: 'center',
        cursor: 'pointer',
        background: '#f8fafc',
        transition: 'border-color 0.2s',
    },
    chooseFileBtn: {
        background: '#2F4AAC',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: 8,
        fontSize: '0.9rem',
        fontWeight: 600,
        cursor: 'pointer',
        marginBottom: 8,
    },
    uploadHint: {
        margin: 0,
        fontSize: '0.8rem',
        color: '#64748b',
    },
    overallCard: {
        background: 'linear-gradient(135deg, #000B72 0%, #2F4AAC 100%)',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 4px 14px rgba(0, 11, 114, 0.3)',
        color: 'white',
        textAlign: 'center',
    },
    overallTitle: {
        margin: '0 0 20px 0',
        fontSize: '1rem',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.95)',
    },
    overallRingWrapper: {
        position: 'relative',
        width: 120,
        height: 120,
        margin: '0 auto 20px',
    },
    overallRing: {
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        transform: 'rotate(-90deg)',
    },
    overallRingInner: {
        position: 'absolute',
        inset: 8,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #000B72 0%, #2F4AAC 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    overallPctText: {
        fontSize: '1.75rem',
        fontWeight: 800,
        color: 'white',
    },
    overallCredits: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    },
    overallCreditsNum: {
        fontSize: '1.25rem',
        fontWeight: 700,
    },
    overallCreditsLabel: {
        fontSize: '0.85rem',
        opacity: 0.9,
    },
    overallHr: {
        border: 'none',
        borderTop: '1px solid rgba(255,255,255,0.3)',
        margin: '16px 0',
    },
    overallRemaining: {
        margin: 0,
        fontSize: '0.9rem',
        opacity: 0.95,
    },
    middleCol: {
        minWidth: 0,
    },
    sectionTitle: {
        margin: '0 0 16px 0',
        fontSize: '1rem',
        fontWeight: 600,
        color: '#1e293b',
    },
    reqGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 16,
        marginBottom: 16,
    },
    reqCard: {
        background: 'white',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    reqCardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        width: '100%',
        justifyContent: 'center',
        minHeight: 48,
        textAlign: 'center',
    },
    reqIcon: {
        flexShrink: 0,
    },
    reqName: {
        fontSize: '0.85rem',
        fontWeight: 600,
        color: '#1e293b',
        textAlign: 'center',
    },
    reqPctText: {
        fontSize: '1rem',
        fontWeight: 800,
        color: '#1e293b',
    },
    reqRingWrapper: {
        position: 'relative',
        width: 80,
        height: 80,
        marginBottom: 12,
    },
    reqRing: {
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        transform: 'rotate(-90deg)',
    },
    reqRingInner: {
        position: 'absolute',
        inset: 10,
        borderRadius: '50%',
        background: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    reqStats: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
    },
    reqCredits: {
        fontSize: '0.9rem',
        color: '#475569',
    },
    reqInProgress: {
        fontSize: '0.8rem',
        color: '#E6BD39',
        fontWeight: 600,
    },
    reqRemaining: {
        fontSize: '0.8rem',
        color: '#94a3b8',
    },
    legend: {
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
        fontSize: '0.8rem',
        color: '#64748b',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: '50%',
    },
    rightCol: {
        background: 'white',
        borderRadius: 12,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 600,
        minWidth: 0,
    },
    tabsWrapper: {
        borderBottom: '1px solid #e2e8f0',
        marginBottom: 16,
        width: '100%',
    },
    tabs: {
        display: 'inline-flex',
        flexWrap: 'nowrap',
        gap: 0,
        width: 'fit-content',
    },
    tab: {
        padding: '10px 4px',
        background: 'none',
        border: 'none',
        fontSize: '0.9rem',
        color: '#64748b',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
        marginBottom: -1,
        flex: '0 0 auto',
        whiteSpace: 'nowrap',
    },
    tabActive: {
        color: '#2F4AAC',
        fontWeight: 600,
        borderBottomColor: '#2F4AAC',
    },
    courseList: {
        overflowY: 'auto',
        flex: 1,
    },
    courseEmpty: {
        color: '#94a3b8',
        fontSize: '0.9rem',
        margin: 0,
    },
    courseRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid #f1f5f9',
        gap: 12,
    },
    courseInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 0,
        flex: 1,
        overflow: 'hidden',
    },
    courseCode: {
        fontSize: '0.95rem',
        fontWeight: 600,
        color: '#1e293b',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    courseCredits: {
        fontSize: '0.8rem',
        color: '#94a3b8',
    },
    courseBadge: {
        width: 22,
        height: 22,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.65rem',
        fontWeight: 600,
    },
    badgeComplete: {
        background: '#065f46',
        color: 'white',
    },
    badgeCurrent: {
        background: '#fef3c7',
        color: '#b45309',
    },
    badgeTodo: {
        background: '#e2e8f0',
        color: '#64748b',
    },
};

export default App;
