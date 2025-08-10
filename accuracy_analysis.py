import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import matplotlib.pyplot as plt
import seaborn as sns

def load_data():
    """Load the results data"""
    df = pd.read_csv('results.csv')
    # Filter to only include historical data with actual tiers (2011-2021)
    historical_df = df[
        (df['Actual Tier'].notna()) & 
        (df['Draft Year'] >= 2011) & 
        (df['Draft Year'] <= 2021)
    ].copy()
    return historical_df

def define_tier_categories():
    """Define what constitutes different tier categories"""
    tier_definitions = {
        'superstar': 7,      # Tier 7
        'all_star': 6,       # Tier 6  
        'strong_starter': 5, # Tier 5
        'starter': 4,        # Tier 4
        'role_player': 3,    # Tier 3
        'bench': 2,          # Tier 2
        'deep_bench': 1,     # Tier 1
        'scrub': 0           # Tier 0
    }
    return tier_definitions

def calculate_basic_metrics(df):
    """Calculate basic regression metrics"""
    metrics = {}
    
    # Overall metrics
    metrics['mae'] = mean_absolute_error(df['Actual Tier'], df['Predicted Score'])
    metrics['rmse'] = np.sqrt(mean_squared_error(df['Actual Tier'], df['Predicted Score']))
    metrics['r2'] = r2_score(df['Actual Tier'], df['Predicted Score'])
    
    # Correlation
    metrics['correlation'] = df['Actual Tier'].corr(df['Predicted Score'])
    
    return metrics

def calculate_top_tier_accuracy(df, top_tier_threshold=5):
    """Calculate accuracy for identifying top-tier players"""
    # Define top-tier as tier 5+ (strong starter and above)
    actual_top_tier = df['Actual Tier'] >= top_tier_threshold
    predicted_top_tier = df['Predicted Score'] >= top_tier_threshold
    
    # Calculate various accuracy metrics
    total_top_tier = actual_top_tier.sum()
    correctly_identified = (actual_top_tier & predicted_top_tier).sum()
    false_positives = (predicted_top_tier & ~actual_top_tier).sum()
    false_negatives = (actual_top_tier & ~predicted_top_tier).sum()
    
    # Precision: Of those predicted as top-tier, how many actually were?
    precision = correctly_identified / (correctly_identified + false_positives) if (correctly_identified + false_positives) > 0 else 0
    
    # Recall: Of those actually top-tier, how many did we identify?
    recall = correctly_identified / total_top_tier if total_top_tier > 0 else 0
    
    # F1 Score: Harmonic mean of precision and recall
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    # Overall accuracy for top-tier identification
    accuracy = correctly_identified / total_top_tier if total_top_tier > 0 else 0
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'total_top_tier': total_top_tier,
        'correctly_identified': correctly_identified,
        'false_positives': false_positives,
        'false_negatives': false_negatives
    }

def calculate_tier_accuracy(df):
    """Calculate accuracy for each tier level"""
    tier_accuracies = {}
    
    for tier in range(8):  # Tiers 0-7
        actual_tier = df['Actual Tier'] == tier
        predicted_tier = np.round(df['Predicted Score']) == tier
        
        if actual_tier.sum() > 0:
            accuracy = (actual_tier & predicted_tier).sum() / actual_tier.sum()
            tier_accuracies[f'tier_{tier}'] = {
                'accuracy': accuracy,
                'count': actual_tier.sum()
            }
    
    return tier_accuracies

def calculate_position_metrics(df):
    """Calculate metrics by position group"""
    position_metrics = {}
    
    for position in df['Position Group'].unique():
        pos_df = df[df['Position Group'] == position]
        if len(pos_df) > 0:
            position_metrics[position] = {
                'mae': mean_absolute_error(pos_df['Actual Tier'], pos_df['Predicted Score']),
                'rmse': np.sqrt(mean_squared_error(pos_df['Actual Tier'], pos_df['Predicted Score'])),
                'r2': r2_score(pos_df['Actual Tier'], pos_df['Predicted Score']),
                'correlation': pos_df['Actual Tier'].corr(pos_df['Predicted Score']),
                'count': len(pos_df)
            }
    
    return position_metrics

def calculate_draft_position_accuracy(df):
    """Calculate accuracy by draft position ranges"""
    # Define draft position ranges
    df['Draft_Range'] = pd.cut(df['Pick Number'], 
                              bins=[0, 5, 10, 20, 30, 60], 
                              labels=['Top 5', '6-10', '11-20', '21-30', '31-60'])
    
    draft_metrics = {}
    for range_name in df['Draft_Range'].unique():
        if pd.notna(range_name):
            range_df = df[df['Draft_Range'] == range_name]
            if len(range_df) > 0:
                draft_metrics[range_name] = {
                    'mae': mean_absolute_error(range_df['Actual Tier'], range_df['Predicted Score']),
                    'rmse': np.sqrt(mean_squared_error(range_df['Actual Tier'], range_df['Predicted Score'])),
                    'r2': r2_score(range_df['Actual Tier'], range_df['Predicted Score']),
                    'correlation': range_df['Actual Tier'].corr(range_df['Predicted Score']),
                    'count': len(range_df)
                }
    
    return draft_metrics

def analyze_superstar_identification(df):
    """Specifically analyze superstar (tier 5 or 7) identification with 3.0+ threshold"""
    # Players who actually became tier 5 or 7
    actual_superstars = (df['Actual Tier'] == 5) | (df['Actual Tier'] == 7)
    # Players predicted to have score 3.5 or higher
    predicted_superstars = df['Predicted Score'] >= 3.0
    
    total_superstars = actual_superstars.sum()
    correctly_identified = (actual_superstars & predicted_superstars).sum()
    false_positives = (predicted_superstars & ~actual_superstars).sum()
    false_negatives = (actual_superstars & ~predicted_superstars).sum()
    
    if total_superstars > 0:
        accuracy = correctly_identified / total_superstars
        precision = correctly_identified / (correctly_identified + false_positives) if (correctly_identified + false_positives) > 0 else 0
        recall = correctly_identified / total_superstars
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    else:
        accuracy = precision = recall = f1 = 0
    
    return {
        'accuracy': accuracy,
        'precision': precision,
        'recall': recall,
        'f1_score': f1,
        'total_superstars': total_superstars,
        'correctly_identified': correctly_identified,
        'false_positives': false_positives,
        'false_negatives': false_negatives
    }

def print_results(metrics, top_tier_metrics, tier_accuracies, position_metrics, draft_metrics, superstar_metrics):
    """Print all results in a formatted way"""
    print("=" * 60)
    print("NBA DRAFT PREDICTOR ACCURACY ANALYSIS")
    print("=" * 60)
    
    print("\n📊 OVERALL MODEL PERFORMANCE")
    print("-" * 30)
    print(f"Mean Absolute Error: {metrics['mae']:.3f}")
    print(f"Root Mean Square Error: {metrics['rmse']:.3f}")
    print(f"R² Score: {metrics['r2']:.3f}")
    print(f"Correlation: {metrics['correlation']:.3f}")
    
    print("\n🏆 TOP-TIER IDENTIFICATION ACCURACY (Tier 5+)")
    print("-" * 45)
    print(f"Accuracy: {top_tier_metrics['accuracy']:.1%}")
    print(f"Precision: {top_tier_metrics['precision']:.1%}")
    print(f"Recall: {top_tier_metrics['recall']:.1%}")
    print(f"F1 Score: {top_tier_metrics['f1_score']:.1%}")
    print(f"Total Top-Tier Players: {top_tier_metrics['total_top_tier']}")
    print(f"Correctly Identified: {top_tier_metrics['correctly_identified']}")
    print(f"False Positives: {top_tier_metrics['false_positives']}")
    print(f"False Negatives: {top_tier_metrics['false_negatives']}")
    
    print("\n⭐ TOP-TIER IDENTIFICATION (Tier 5 or 7 with 3.0+ threshold)")
    print("-" * 55)
    print(f"Accuracy: {superstar_metrics['accuracy']:.1%}")
    print(f"Precision: {superstar_metrics['precision']:.1%}")
    print(f"Recall: {superstar_metrics['recall']:.1%}")
    print(f"F1 Score: {superstar_metrics['f1_score']:.1%}")
    print(f"Total Tier 5 or 7 Players: {superstar_metrics['total_superstars']}")
    print(f"Correctly Identified (3.0+ score): {superstar_metrics['correctly_identified']}")
    
    print("\n🎯 ACCURACY BY POSITION")
    print("-" * 25)
    for position, pos_metrics in position_metrics.items():
        print(f"{position:6}: MAE={pos_metrics['mae']:.3f}, R²={pos_metrics['r2']:.3f}, n={pos_metrics['count']}")
    
    print("\n📈 ACCURACY BY DRAFT POSITION")
    print("-" * 30)
    for draft_range, draft_metrics in draft_metrics.items():
        print(f"{draft_range:8}: MAE={draft_metrics['mae']:.3f}, R²={draft_metrics['r2']:.3f}, n={draft_metrics['count']}")
    
    print("\n🔢 TIER-LEVEL ACCURACY")
    print("-" * 25)
    for tier, tier_metrics in tier_accuracies.items():
        print(f"{tier:7}: {tier_metrics['accuracy']:.1%} (n={tier_metrics['count']})")

def create_visualizations(df):
    """Create visualizations of the results"""
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    
    # Scatter plot of predicted vs actual
    axes[0, 0].scatter(df['Actual Tier'], df['Predicted Score'], alpha=0.6)
    axes[0, 0].plot([0, 7], [0, 7], 'r--', alpha=0.8)
    axes[0, 0].set_xlabel('Actual Tier')
    axes[0, 0].set_ylabel('Predicted Score')
    axes[0, 0].set_title('Predicted vs Actual Tiers')
    axes[0, 0].grid(True, alpha=0.3)
    
    # Error distribution
    errors = df['Predicted Score'] - df['Actual Tier']
    axes[0, 1].hist(errors, bins=20, alpha=0.7, edgecolor='black')
    axes[0, 1].axvline(0, color='red', linestyle='--', alpha=0.8)
    axes[0, 1].set_xlabel('Prediction Error')
    axes[0, 1].set_ylabel('Frequency')
    axes[0, 1].set_title('Prediction Error Distribution')
    axes[0, 1].grid(True, alpha=0.3)
    
    # Accuracy by position
    position_errors = []
    position_names = []
    for position in df['Position Group'].unique():
        pos_df = df[df['Position Group'] == position]
        mae = mean_absolute_error(pos_df['Actual Tier'], pos_df['Predicted Score'])
        position_errors.append(mae)
        position_names.append(position)
    
    axes[1, 0].bar(position_names, position_errors)
    axes[1, 0].set_ylabel('Mean Absolute Error')
    axes[1, 0].set_title('MAE by Position Group')
    axes[1, 0].grid(True, alpha=0.3)
    
    # Top-tier identification confusion matrix
    top_tier_threshold = 5
    actual_top_tier = df['Actual Tier'] >= top_tier_threshold
    predicted_top_tier = df['Predicted Score'] >= top_tier_threshold
    
    from sklearn.metrics import confusion_matrix
    cm = confusion_matrix(actual_top_tier, predicted_top_tier)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['Not Top-Tier', 'Top-Tier'],
                yticklabels=['Not Top-Tier', 'Top-Tier'],
                ax=axes[1, 1])
    axes[1, 1].set_title('Top-Tier Identification Confusion Matrix')
    axes[1, 1].set_xlabel('Predicted')
    axes[1, 1].set_ylabel('Actual')
    
    plt.tight_layout()
    plt.savefig('accuracy_analysis.png', dpi=300, bbox_inches='tight')
    plt.show()

def main():
    """Main analysis function"""
    print("Loading data...")
    df = load_data()
    
    print(f"Analyzing {len(df)} historical draft picks (2011-2021)...")
    
    # Calculate all metrics
    metrics = calculate_basic_metrics(df)
    top_tier_metrics = calculate_top_tier_accuracy(df)
    tier_accuracies = calculate_tier_accuracy(df)
    position_metrics = calculate_position_metrics(df)
    draft_metrics = calculate_draft_position_accuracy(df)
    superstar_metrics = analyze_superstar_identification(df)
    
    # Print results
    print_results(metrics, top_tier_metrics, tier_accuracies, position_metrics, draft_metrics, superstar_metrics)
    
    # Create visualizations
    print("\n📊 Creating visualizations...")
    create_visualizations(df)
    
    # Summary for resume
    print("\n" + "=" * 60)
    print("📝 RESUME SUMMARY")
    print("=" * 60)
    print(f"Top-tier identification accuracy: {top_tier_metrics['accuracy']:.1%}")
    print(f"Tier 5/7 identification accuracy (3.0+ threshold): {superstar_metrics['accuracy']:.1%}")
    print(f"Overall model correlation: {metrics['correlation']:.3f}")
    print(f"Mean absolute error: {metrics['mae']:.2f} tiers")
    
    # Save detailed results to CSV
    results_summary = {
        'Metric': ['Top-Tier Accuracy', 'Tier 5/7 Accuracy (3.0+)', 'Overall Correlation', 'MAE', 'RMSE', 'R²'],
        'Value': [
            f"{top_tier_metrics['accuracy']:.1%}",
            f"{superstar_metrics['accuracy']:.1%}", 
            f"{metrics['correlation']:.3f}",
            f"{metrics['mae']:.3f}",
            f"{metrics['rmse']:.3f}",
            f"{metrics['r2']:.3f}"
        ]
    }
    
    pd.DataFrame(results_summary).to_csv('accuracy_summary.csv', index=False)
    print("\n✅ Results saved to 'accuracy_summary.csv' and 'accuracy_analysis.png'")

if __name__ == "__main__":
    main()
