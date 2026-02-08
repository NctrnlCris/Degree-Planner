"""
Functions that process the input Excel/CSV transcript data.
"""
import os
import pandas as pd
import numpy as np

UPLOAD_DIR = "uploads"


def load_transcript(filepath: str) -> pd.DataFrame:
    """Load transcript from Excel or CSV file."""
    ext = os.path.splitext(filepath)[1].lower()
    if ext in ('.xlsx', '.xls'):
        # Excel often has a title row; skip first row
        return pd.read_excel(filepath, skiprows=1)
    elif ext == '.csv':
        return pd.read_csv(filepath, skiprows=0)
    else:
        raise ValueError(f"Unsupported file format: {ext}")

def process_file_with_credits(df: pd.DataFrame):
    """
    Processes the input file into a pandas DataFrame.
    """
    df["Required_Credits"] = df["Requirement"].str.extract(r"^(\d+)\s*\D")

    df["Completion_Status"] = np.where(df["Grade"].isnull(), 0, 1)
    df["InProgress_Status"] = np.where(df["Grade"].isnull(), 1, 0)
    df["Completed_Credits"] = df["Completion_Status"] * df["Credits"]
    df["InProgress_Credits"] = df["InProgress_Status"] * df["Credits"]

    df_subset = df[["Requirement","Required_Credits","Completed_Credits","InProgress_Credits"]]
    output_df = df_subset.groupby(["Requirement", "Required_Credits"]).sum().reset_index()
    output_df["Required_Credits"] = output_df["Required_Credits"].astype(int)
    output_df["Completed_Credits"] = output_df["Completed_Credits"].astype(int)
    output_df["InProgress_Credits"] = output_df["InProgress_Credits"].astype(int)
    return output_df.to_json(orient="records",indent=4,index=False)

def process_indiv(df: pd.DataFrame):
    """
    Processes the input file into a pandas DataFrame.
    """
    df_indiv = df[df["Requirement"].str.match(r"^\D{4}_V")]
    df_indiv.to_csv("output_indiv.csv")
    complete = df_indiv[df_indiv["Status"] == "Satisfied"]["Requirement"]
    inprogress = df_indiv[df_indiv["Status"] == "In Progress"]["Requirement"]
    missing = df_indiv[df_indiv["Status"] == "Not Satisfied"]["Requirement"]
    data = {
    'name': ['complete', 'inprogress', 'missing'],
    'list': [complete, inprogress, missing],
    }
    output_df = pd.DataFrame(data)
    return output_df.to_json(orient="records",indent=4,index=False)


def process_remaining(df: pd.DataFrame):
    """
    Processes remaining requirements not covered by the other two categories.
    
    :param df: Description
    :type df: pd.DataFrame
    :param df_credits: Description
    :type df_credits: pd.DataFrame
    :param df_indiv: Description
    :type df_indiv: pd.DataFrame
    """
    credit_mask = df["Requirement"].str.extract(r"^(\d+)\s*\D", expand=False).notna()
    df_credits = df[credit_mask]

    output_remain_df = df[~df['Requirement'].isin(df_credits["Requirement"])]
    output_remain_df = output_remain_df.drop_duplicates("Requirement")[["Requirement", "Status"]]

    complete = output_remain_df[output_remain_df["Status"] == "Satisfied"]["Requirement"].tolist()
    inprogress = output_remain_df[output_remain_df["Status"] == "In Progress"]["Requirement"].tolist()
    missing = output_remain_df[output_remain_df["Status"] == "Not Satisfied"]["Requirement"].tolist()
    data = {
        'name': ['complete', 'inprogress', 'missing'],
        'list': [complete, inprogress, missing],
    }
    output_df = pd.DataFrame(data)
    return output_df.to_json(orient="records", indent=4, index=False)


def get_processed_with_credits(filepath: str):
    """
    Produce the json for the degree requirements that can be broken down
    by credits required/completed/in-progress.

    :param filepath: Full path to the Excel or CSV file.
    :type filepath: str
    """
    input_df = load_transcript(filepath)
    credits_output_json = process_file_with_credits(input_df)
    return credits_output_json


def get_processed_remaining(filepath: str):
    """
    Produce the json for the remaining degree requirements (no credit breakdown).

    :param filepath: Full path to the Excel or CSV file.
    :type filepath: str
    """
    input_df = load_transcript(filepath)
    remaining_output_json = process_remaining(input_df)
    return remaining_output_json
